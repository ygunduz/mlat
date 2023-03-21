package main

import (
	"context"
	"encoding/xml"
	"errors"
	"fmt"
	"github.com/beevik/etree"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"log"
	"os"
	"strings"
)

// App struct
type App struct {
	ctx          context.Context
	selectedFile string
	container    *Container
	settings     Settings
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved,
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	data, err := os.ReadFile("settings.xml")
	if err != nil {
		log.Fatal(err)
	}
	var settings Settings
	if err := xml.Unmarshal(data, &settings); err != nil {
		log.Fatal(err)
	}
	a.settings = settings
}

func updateNode(file string, a *App, cb func(document *etree.Document) error) (Container, error) {
	document := etree.NewDocument()
	document.WriteSettings.CanonicalText = true
	err := document.ReadFromFile(file)
	if err != nil {
		return Container{}, err
	}
	err = cb(document)
	if err != nil {
		return Container{}, err
	}
	err = document.WriteToFile(file)
	if err != nil {
		return Container{}, err
	}
	contents, err := readFileContents(file, a)
	a.container = contents
	return *contents, err
}

func updateCoveredReceivers(coveredReceivers string, transmitter *etree.Element) error {
	newReceivers := strings.Split(coveredReceivers, ", ")
	cr := etree.NewElement("CoveredReceivers")
	old := transmitter.FindElement("CoveredReceivers")
	childTail := "\n\t\t\t\t\t\t"
	lastChildTail := "\n\t\t\t\t\t"
	oldText := old.Text()
	if len(old.ChildElements()) > 0 {
		childTail = old.ChildElements()[0].Tail()
		lastChildTail = old.ChildElements()[len(old.ChildElements())-1].Tail()
	}
	for i, newReceiver := range newReceivers {
		elem := etree.NewElement("ReceiverId")
		elem.SetText(newReceiver)
		cr.InsertChildAt(i, elem)
	}
	for i, child := range cr.ChildElements() {
		child.SetTail(childTail)
		if i == len(cr.ChildElements())-1 {
			child.SetTail(lastChildTail)
		}
	}
	index := old.Index()
	transmitter.RemoveChild(old)
	transmitter.InsertChildAt(index, cr)
	cr.SetText(oldText)
	return nil
}

func updateSite(siteJson *Site, document *etree.Document) error {
	site := document.FindElement("//Site[@id='" + siteJson.Id + "']")
	if site == nil {
		return errors.New("site element not found")
	}
	site.FindElement("Latitude").SetText(fmt.Sprintf("%g", siteJson.Latitude))
	site.FindElement("Longitude").SetText(fmt.Sprintf("%g", siteJson.Longitude))
	site.FindElement("Height").SetText(fmt.Sprintf("%g", siteJson.Height))
	return nil
}

func secondsToNanos(seconds float64) float64 {
	return seconds * 1000000000
}

func (a *App) GetSettings() Settings {
	return a.settings
}

func (a *App) UpdateSettings(settings Settings) Settings {
	data, err := xml.MarshalIndent(settings, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	err = os.WriteFile("settings.xml", data, 0644)
	if err != nil {
		log.Fatal(err)
	}
	a.settings = settings
	return settings
}

func (a *App) SelectFile() (Container, error) {
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{DefaultFilename: "mss.cfg", Filters: []runtime.FileFilter{
		{
			DisplayName: "Xml Configs (*.xml, *.cfg)",
			Pattern:     "*.xml;*.cfg",
		},
	}})
	if err != nil {
		return Container{}, err
	}
	a.selectedFile = file
	contents, err := readFileContents(file, a)
	if err != nil {
		return Container{}, err
	}
	a.container = contents
	return *contents, nil
}

func (a *App) ReloadData() (Container, error) {
	contents, err := readFileContents(a.selectedFile, a)
	if err != nil {
		return Container{}, err
	}
	a.container = contents
	return *contents, nil
}

func (a *App) UpdateTransponder(transponderJson Transponder) (Container, error) {
	return updateNode(a.selectedFile, a, func(document *etree.Document) error {
		transponder := document.FindElement("//Transponder[@id='" + transponderJson.Id + "']")
		if transponder == nil {
			return errors.New("transponder element not found")
		}
		err := updateCoveredReceivers(transponderJson.CoveredReceivers, transponder)
		if err != nil {
			return err
		}
		return updateSite(transponderJson.Site, document)
	})
}

func (a *App) UpdateTransmitter(transmitterJson Transmitter) (Container, error) {
	return updateNode(a.selectedFile, a, func(document *etree.Document) error {
		transmitter := document.FindElement("//Transmitter[@id='" + transmitterJson.Id + "']")
		if transmitter == nil {
			return errors.New("transmitter element not found")
		}
		err := updateCoveredReceivers(transmitterJson.CoveredReceivers, transmitter)
		if err != nil {
			return err
		}
		return updateSite(transmitterJson.Site, document)
	})
}

func (a *App) UpdateReceiver(receiverJson Receiver) (Container, error) {
	return updateNode(a.selectedFile, a, func(document *etree.Document) error {
		receiver := document.FindElement("//Receiver[@id='" + receiverJson.Id + "']")
		if receiver == nil {
			return errors.New("receiver element not found")
		}
		fmt.Println(receiverJson.CableLengthA, receiverJson.CableLengthB)
		receiver.FindElement("DataLink/Dual/A/AddDelaySSR").SetText(fmt.Sprintf("%.2f", secondsToNanos(receiverJson.CableLengthA/a.settings.LightSpeed)))
		receiver.FindElement("DataLink/Dual/B/AddDelaySSR").SetText(fmt.Sprintf("%.2f", secondsToNanos(receiverJson.CableLengthB/a.settings.LightSpeed)))
		return updateSite(receiverJson.Site, document)
	})
}

func (a *App) UpdateDataChannel(channel UpdateDataChannel) (Container, error) {
	return updateNode(a.selectedFile, a, func(document *etree.Document) error {
		for _, item := range channel.Items {
			for _, element := range document.FindElements("//DataProcessing[@id='" + item.Key + "']/DataChannels/DataChannel/ReceiverId") {
				if strings.TrimSpace(element.Text()) == channel.Id {
					value := "0"
					if item.Value {
						value = "1"
					}
					element.Parent().FindElement("Enabled").SetText(value)
				}
			}
		}
		return nil
	})
}

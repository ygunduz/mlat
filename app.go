package main

import (
	"context"
	"encoding/xml"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/beevik/etree"
	"github.com/wailsapp/wails/v2/pkg/runtime"
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

func (a *App) updateNode(file string, cb func(document *etree.Document) error) (Container, error) {
	document := etree.NewDocument()
	document.WriteSettings.CanonicalText = true
	err := document.ReadFromFile(file)
	if err != nil {
		return *a.container, err
	}
	err = cb(document)
	if err != nil {
		return *a.container, err
	}
	err = document.WriteToFile(file)
	if err != nil {
		return *a.container, err
	}
	err = a.readFileContents(file)
	if err != nil {
		return *a.container, err
	}
	return *a.container, nil
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
	err = a.readFileContents(file)
	if err != nil {
		return Container{}, err
	}
	return *a.container, nil
}

func (a *App) ReloadData() (Container, error) {
	err := a.readFileContents(a.selectedFile)
	if err != nil {
		return Container{}, err
	}
	return *a.container, nil
}

func (a *App) UpdateChannel(channelJson Channel) (Container, error) {
	return a.updateNode(a.selectedFile, func(document *etree.Document) error {
		ip := document.FindElement("//Address[@id='" + channelJson.IPId + "']")
		if ip == nil {
			return errors.New("ip element not found")
		}
		ip.SetText(channelJson.MulticastIp)
		port := document.FindElement("//Port[@id='" + channelJson.PortId + "']")
		if port == nil {
			return errors.New("port element not found")
		}
		port.SetText(fmt.Sprintf("%d", channelJson.Port))
		return nil
	})
}

func (a *App) UpdateTransponder(transponderJson Transponder) (Container, error) {
	return a.updateNode(a.selectedFile, func(document *etree.Document) error {
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
	return a.updateNode(a.selectedFile, func(document *etree.Document) error {
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
	return a.updateNode(a.selectedFile, func(document *etree.Document) error {
		receiver := document.FindElement("//Receiver[@id='" + receiverJson.Id + "']")
		if receiver == nil {
			return errors.New("receiver element not found")
		}
		fmt.Println(receiverJson.CableLengthA, receiverJson.CableLengthB)
		receiver.FindElement("DataLink/Dual/A/AddDelaySSR").SetText(fmt.Sprintf("%.2f", receiverJson.CableLengthA))
		receiver.FindElement("DataLink/Dual/B/AddDelaySSR").SetText(fmt.Sprintf("%.2f", receiverJson.CableLengthB))
		return updateSite(receiverJson.Site, document)
	})
}

func (a *App) UpdateDataChannel(channel UpdateDataChannel) (Container, error) {
	return a.updateNode(a.selectedFile, func(document *etree.Document) error {
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

func (a *App) GetAreas() (Areas, error) {
	return decodeAreas(a.selectedFile)
}

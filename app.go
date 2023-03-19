package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/beevik/etree"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx          context.Context
	selectedFile string
	container    *Container
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
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
	contents, err := readFileContents(file)
	if err != nil {
		return Container{}, err
	}
	a.container = contents
	return *contents, nil
}

func updateNode(file string, cb func(document *etree.Document) error) (Container, error) {
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
	contents, err := readFileContents(file)
	return *contents, err
}

func (a *App) UpdateReceiver(receiverJson Receiver) (Container, error) {
	return updateNode(a.selectedFile, func(document *etree.Document) error {
		receiver := document.FindElement("//Receiver[@id='" + receiverJson.Id + "']")
		if receiver == nil {
			return errors.New("receiver element not found")
		}
		receiver.FindElement("DataLink/Dual/A/AddDelaySSR").SetText(fmt.Sprintf("%g", receiverJson.AddDelaySSRA))
		receiver.FindElement("DataLink/Dual/B/AddDelaySSR").SetText(fmt.Sprintf("%g", receiverJson.AddDelaySSRB))
		site := document.FindElement("//Site[@id='" + receiverJson.Site.Id + "']")
		if site == nil {
			return errors.New("site element not found")
		}
		site.FindElement("Latitude").SetText(fmt.Sprintf("%g", receiverJson.Site.Latitude))
		site.FindElement("Longitude").SetText(fmt.Sprintf("%g", receiverJson.Site.Longitude))
		site.FindElement("Height").SetText(fmt.Sprintf("%g", receiverJson.Site.Height))
		return nil
	})
}

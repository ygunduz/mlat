package main

import (
	"context"
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

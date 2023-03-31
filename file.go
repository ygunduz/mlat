package main

import (
	"encoding/xml"
	"io"
	"log"
	"os"
	"strings"
)

func nanosToSeconds(nanos float64) float64 {
	return nanos / 1000000000
}

func (a *App) readDataProcessing(decoder *xml.Decoder, el *xml.StartElement) error {
	var dataProcessing dataProcessing
	if err := decoder.DecodeElement(&dataProcessing, el); err != nil {
		return err
	}
	var items []DataChannelItem
	for _, channel := range dataProcessing.DataChannels.DataChannel {
		items = append(items, DataChannelItem{
			Enabled:    channel.Enabled,
			ReceiverId: channel.ReceiverId,
		})
	}
	a.container.DataChannels = append(a.container.DataChannels, DataChannel{dataProcessing.Id, items})
	return nil
}

func (a *App) readTransponders(decoder *xml.Decoder, el *xml.StartElement) error {
	var transponder transponder
	if err := decoder.DecodeElement(&transponder, el); err != nil {
		return err
	}
	s := findSite(a.container.Sites, transponder.SiteId)
	coveredReceivers := strings.Join(transponder.CoveredReceivers.ReceiverId, ", ")
	a.container.Transponders = append(a.container.Transponders, Transponder{
		transponder.Id,
		transponder.SiteId,
		transponder.ModeSAddress,
		Diag{
			transponder.Diag.Height,
			transponder.Diag.Info,
		},
		coveredReceivers,
		s})
	return nil
}

func (a *App) readTransmitters(decoder *xml.Decoder, el *xml.StartElement) error {
	var transmitter transmitter
	if err := decoder.DecodeElement(&transmitter, el); err != nil {
		return err
	}
	s := findSite(a.container.Sites, transmitter.SiteId)
	coveredReceivers := strings.Join(transmitter.CoveredReceivers.ReceiverId, ", ")
	a.container.Transmitters = append(a.container.Transmitters, Transmitter{
		transmitter.Id,
		transmitter.SiteId,
		transmitter.TXLUId,
		transmitter.ModeSAddress,
		coveredReceivers,
		s,
		transmitter.CoveredAreaId,
	})
	return nil
}

func (a *App) readReceivers(decoder *xml.Decoder, el *xml.StartElement) error {
	var receiver receiver
	if err := decoder.DecodeElement(&receiver, el); err != nil {
		return err
	}
	s := findSite(a.container.Sites, receiver.SiteId)
	a.container.Receivers = append(a.container.Receivers, Receiver{
		receiver.Id,
		receiver.SiteId,
		receiver.DataLink.Dual.A.AddDelaySSR,
		receiver.DataLink.Dual.B.AddDelaySSR,
		s,
		nanosToSeconds(receiver.DataLink.Dual.A.AddDelaySSR) * a.settings.LightSpeed,
		nanosToSeconds(receiver.DataLink.Dual.B.AddDelaySSR) * a.settings.LightSpeed,
	})
	return nil
}

func (a *App) readSites(decoder *xml.Decoder, el *xml.StartElement) error {
	var site site
	if err := decoder.DecodeElement(&site, el); err != nil {
		return err
	}
	a.container.Sites = append(a.container.Sites, Site{site.Id, site.Description, site.Latitude, site.Longitude, site.Height})
	return nil
}

func (a *App) readFileContents(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	decoder := xml.NewDecoder(file)
	a.container = &Container{
		Sites:        make([]Site, 0),
		Receivers:    make([]Receiver, 0),
		Transmitters: make([]Transmitter, 0),
		Transponders: make([]Transponder, 0),
		DataChannels: make([]DataChannel, 0),
	}
	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("error getting token: %v\n", err)
			break
		}

		switch v := token.(type) {
		case xml.StartElement:
			if v.Name.Local == "Site" {
				err := a.readSites(decoder, &v)
				if err != nil {
					return err
				}
				continue
			} else if v.Name.Local == "Receiver" {
				err := a.readReceivers(decoder, &v)
				if err != nil {
					return err
				}
				continue
			} else if v.Name.Local == "Transmitter" {
				err := a.readTransmitters(decoder, &v)
				if err != nil {
					return err
				}
				continue
			} else if v.Name.Local == "Transponder" {
				err := a.readTransponders(decoder, &v)
				if err != nil {
					return err
				}
				continue
			} else if v.Name.Local == "DataProcessing" {
				err := a.readDataProcessing(decoder, &v)
				if err != nil {
					return err
				}
				continue
			}
		}
	}
	return nil
}

func findSite(sites []Site, id string) *Site {
	for _, site := range sites {
		if site.Id == id {
			return &site
		}
	}
	return nil
}

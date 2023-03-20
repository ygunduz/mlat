package main

import (
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
)

func readFileContents(path string) (*Container, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	decoder := xml.NewDecoder(file)
	var sites []Site
	var receivers []Receiver
	var transmitters []Transmitter
	var transponders []Transponder
	var dataChannels []DataChannel
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
				var site site
				if err = decoder.DecodeElement(&site, &v); err != nil {
					return nil, err
				}
				sites = append(sites, Site{site.Id, site.Description, site.Latitude, site.Longitude, site.Height})
				continue
			} else if v.Name.Local == "Receiver" {
				var receiver receiver
				if err = decoder.DecodeElement(&receiver, &v); err != nil {
					return nil, err
				}
				s := findSite(sites, receiver.SiteId)
				receivers = append(receivers, Receiver{receiver.Id, receiver.SiteId, receiver.DataLink.Dual.A.AddDelaySSR, receiver.DataLink.Dual.B.AddDelaySSR, s})
				continue
			} else if v.Name.Local == "Transmitter" {
				var transmitter transmitter
				if err = decoder.DecodeElement(&transmitter, &v); err != nil {
					return nil, err
				}
				s := findSite(sites, transmitter.SiteId)
				coveredReceivers := strings.Join(transmitter.CoveredReceivers.ReceiverId, ", ")
				transmitters = append(transmitters, Transmitter{transmitter.Id, transmitter.SiteId, transmitter.TXLUId, transmitter.ModeSAddress, coveredReceivers, s, transmitter.CoveredAreaId})
				continue
			} else if v.Name.Local == "Transponder" {
				var transponder transponder
				if err = decoder.DecodeElement(&transponder, &v); err != nil {
					return nil, err
				}
				s := findSite(sites, transponder.SiteId)
				coveredReceivers := strings.Join(transponder.CoveredReceivers.ReceiverId, ", ")
				transponders = append(transponders, Transponder{transponder.Id, transponder.SiteId, transponder.ModeSAddress, Diag{transponder.Diag.Height, transponder.Diag.Info}, coveredReceivers, s})
				continue
			} else if v.Name.Local == "DataProcessing" {
				var dataProcessing dataProcessing
				if err = decoder.DecodeElement(&dataProcessing, &v); err != nil {
					return nil, err
				}
				var items []DataChannelItem
				for _, channel := range dataProcessing.DataChannels.DataChannel {
					items = append(items, DataChannelItem{
						Enabled:    channel.Enabled,
						ReceiverId: channel.ReceiverId,
					})
				}
				dataChannels = append(dataChannels, DataChannel{dataProcessing.Id, items})
				continue
			}
		}
	}
	var container Container
	container.Sites = sites
	container.Receivers = receivers
	container.Transmitters = transmitters
	container.Transponders = transponders
	container.DataChannels = dataChannels
	return &container, nil
}

func findCoveredReceivers(coveredReceivers coveredReceivers, receivers []Receiver) []*Receiver {
	var covered []*Receiver
	for _, coveredReceiver := range coveredReceivers.ReceiverId {
		for _, receiver := range receivers {
			if receiver.Id == coveredReceiver {
				fmt.Println(receiver.Id, coveredReceiver)
				covered = append(covered, &receiver)
			}
		}
	}
	return covered
}

func findSite(sites []Site, id string) *Site {
	for _, site := range sites {
		if site.Id == id {
			return &site
		}
	}
	return nil
}

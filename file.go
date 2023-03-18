package main

import (
	"encoding/xml"
	"io"
	"log"
	"os"
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
					log.Fatal(err)
				}
				sites = append(sites, Site{site.Id, site.Description, site.Latitude, site.Longitude, site.Height})
				continue
			} else if v.Name.Local == "Receiver" {
				var receiver receiver
				if err = decoder.DecodeElement(&receiver, &v); err != nil {
					log.Fatal(err)
				}
				s := findSite(sites, receiver.SiteId)
				receivers = append(receivers, Receiver{receiver.Id, receiver.SiteId, receiver.DataLink.Dual.A.AddDelaySSR, receiver.DataLink.Dual.B.AddDelaySSR, s})
				continue
			} else if v.Name.Local == "Transmitter" {
				var transmitter transmitter
				if err = decoder.DecodeElement(&transmitter, &v); err != nil {
					log.Fatal(err)
				}
				s := findSite(sites, transmitter.SiteId)
				c := findCoveredReceivers(transmitter.CoveredReceivers, receivers)
				transmitters = append(transmitters, Transmitter{transmitter.Id, transmitter.SiteId, transmitter.TXLUId, transmitter.ModeSAddress, c, s, transmitter.CoveredAreaId})
				continue
			} else if v.Name.Local == "Transponder" {
				var transponder transponder
				if err = decoder.DecodeElement(&transponder, &v); err != nil {
					log.Fatal(err)
				}
				s := findSite(sites, transponder.SiteId)
				c := findCoveredReceivers(transponder.CoveredReceivers, receivers)
				transponders = append(transponders, Transponder{transponder.Id, transponder.SiteId, transponder.ModeSAddress, Diag{transponder.Diag.Height, transponder.Diag.Info}, c, s})
				continue
			}
		}
	}
	var container Container
	container.Sites = sites
	container.Receivers = receivers
	container.Transmitters = transmitters
	container.Transponders = transponders
	return &container, nil
}

func findCoveredReceivers(coveredReceivers coveredReceivers, receivers []Receiver) []*Receiver {
	var covered []*Receiver
	for _, receiver := range receivers {
		for _, coveredReceiver := range coveredReceivers.ReceiverId {
			if receiver.Id == coveredReceiver {
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

package main

import (
	"encoding/xml"
	"io"
	"log"
	"os"
	"strconv"
	"strings"
)

func nanosToSeconds(nanos float64) float64 {
	return nanos / 1000000000
}

func findCom(comId string, coms *coms) interface{} {
	for _, com := range coms.Udp {
		if com.Id == comId {
			return com
		}
	}
	for _, com := range coms.TcpClient {
		if com.Id == comId {
			return com
		}
	}
	for _, com := range coms.TcpServer {
		if com.Id == comId {
			return com
		}
	}
	return nil
}

func findIp(ipId string, ips *ip) string {
	for _, ip := range ips.Addresses.Address {
		if ip.Id == ipId {
			return ip.Content
		}
	}
	return ""
}

func findPort(portId string, ports *ports) int {
	for _, port := range ports.Port {
		if port.Id == portId {
			return stringToInt(port.Content)
		}
	}
	return 0
}

func stringToInt(content string) int {
	i, err := strconv.Atoi(content)
	if err != nil {
		return 0
	}
	return i
}

func (a *App) readChannels(decoder *xml.Decoder, el *xml.StartElement) error {
	var communications communications
	if err := decoder.DecodeElement(&communications, el); err != nil {
		return err
	}
	for _, channel := range communications.Out.Channels.Channel {
		cm := findCom(channel.ComId, &communications.Com)
		var multicastIp, ipId, portId string
		var port int
		if cm != nil {
			switch cm.(type) {
			case udp:
				udp := cm.(udp)
				ipId = udp.IPId
				portId = udp.PortId
				multicastIp = findIp(udp.IPId, &communications.Ip)
				port = findPort(udp.PortId, &communications.Ip.Ports)
			case tcpClient:
				tcpClient := cm.(tcpClient)
				ipId = tcpClient.IPId
				portId = tcpClient.PortId
				multicastIp = findIp(tcpClient.IPId, &communications.Ip)
				port = findPort(tcpClient.PortId, &communications.Ip.Ports)
			default:
				continue
			}
			a.container.Channels = append(a.container.Channels, Channel{
				Id:          channel.Id,
				Name:        channel.Name,
				ComId:       channel.ComId,
				IPId:        ipId,
				MulticastIp: multicastIp,
				PortId:      portId,
				Port:        port,
			})
		}
	}

	return nil
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
	a.container.DataChannels = append(a.container.DataChannels, DataChannel{dataProcessing.Id,
		dataProcessing.Calibration.OverDeterm.Enabled,
		dataProcessing.Calibration.RefTran.Enabled,
		dataProcessing.Calibration.Height.Enabled,
		items})
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
		receiver.DataLink.Dual.A.AddDelaySSR,
		receiver.DataLink.Dual.B.AddDelaySSR,
		receiver.DisabledAreaId,
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

func (a *App) readAreas() error {
	areas, err := decodeAreas(a.selectedFile)
	for _, area := range areas.Area {
		a.container.Areas = append(a.container.Areas, area)
	}
	return err
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
		Channels:     make([]Channel, 0),
		Areas:        make([]Area, 0),
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
			} else if v.Name.Local == "Communications" {
				err := a.readChannels(decoder, &v)
				if err != nil {
					return err
				}
				continue
			}
		}
	}
	return a.readAreas()
}

func findSite(sites []Site, id string) *Site {
	for _, site := range sites {
		if site.Id == id {
			return &site
		}
	}
	return nil
}

package main

type Container struct {
	Sites        []Site
	Receivers    []Receiver
	Transmitters []Transmitter
	Transponders []Transponder
}

type Site struct {
	Id          string
	Description string
	Latitude    float64
	Longitude   float64
	Height      float64
}

type Receiver struct {
	Id           string
	SiteId       string
	AddDelaySSRA float64
	AddDelaySSRB float64
	Site         *Site
}

type Transmitter struct {
	Id               string
	SiteId           string
	TXLUId           string
	ModeSAddress     string
	CoveredReceivers []*Receiver
	Site             *Site
	CoveredAreaId    string
}

type Transponder struct {
	Id               string
	SiteId           string
	ModeSAddress     string
	Diag             Diag
	CoveredReceivers []*Receiver
	Site             *Site
}

type Diag struct {
	Height float64
	Info   string
}

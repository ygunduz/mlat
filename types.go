package main

type Container struct {
	Sites        []Site        `json:"sites"`
	Receivers    []Receiver    `json:"receivers"`
	Transmitters []Transmitter `json:"transmitters"`
	Transponders []Transponder `json:"transponders"`
}

type Site struct {
	Id          string  `json:"id"`
	Description string  `json:"description"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Height      float64 `json:"height"`
}

type Receiver struct {
	Id           string  `json:"id"`
	SiteId       string  `json:"siteId"`
	AddDelaySSRA float64 `json:"addDelaySSRA"`
	AddDelaySSRB float64 `json:"addDelaySSRB"`
	Site         *Site   `json:"site"`
}

type Transmitter struct {
	Id               string      `json:"id"`
	SiteId           string      `json:"siteId"`
	TXLUId           string      `json:"txluId"`
	ModeSAddress     string      `json:"modeSAddress"`
	CoveredReceivers []*Receiver `json:"coveredReceivers"`
	Site             *Site       `json:"site"`
	CoveredAreaId    string      `json:"coveredAreaId"`
}

type Transponder struct {
	Id               string      `json:"id"`
	SiteId           string      `json:"siteId"`
	ModeSAddress     string      `json:"modeSAddress"`
	Diag             Diag        `json:"diag"`
	CoveredReceivers []*Receiver `json:"coveredReceivers"`
	Site             *Site       `json:"site"`
}

type Diag struct {
	Height float64 `json:"height"`
	Info   string  `json:"info"`
}

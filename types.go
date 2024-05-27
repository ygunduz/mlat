package main

type Container struct {
	Sites        []Site        `json:"sites"`
	Receivers    []Receiver    `json:"receivers"`
	Transmitters []Transmitter `json:"transmitters"`
	Transponders []Transponder `json:"transponders"`
	DataChannels []DataChannel `json:"dataChannels"`
	Channels     []Channel     `json:"channels"`
	Areas        []Area        `json:"areas"`
}

type Site struct {
	Id          string  `json:"id"`
	Description string  `json:"description"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Height      float64 `json:"height"`
}

type Receiver struct {
	Id             string  `json:"id"`
	SiteId         string  `json:"siteId"`
	AddDelaySSRA   float64 `json:"addDelaySSRA"`
	AddDelaySSRB   float64 `json:"addDelaySSRB"`
	Site           *Site   `json:"site"`
	CableLengthA   float64 `json:"cableLengthA"`
	CableLengthB   float64 `json:"cableLengthB"`
	DisabledAreaId string  `json:"disabledAreaId"`
}

type Transmitter struct {
	Id               string `json:"id"`
	SiteId           string `json:"siteId"`
	TXLUId           string `json:"txluId"`
	ModeSAddress     string `json:"modeSAddress"`
	CoveredReceivers string `json:"coveredReceivers"`
	Site             *Site  `json:"site"`
	CoveredAreaId    string `json:"coveredAreaId"`
}

type Transponder struct {
	Id               string `json:"id"`
	SiteId           string `json:"siteId"`
	ModeSAddress     string `json:"modeSAddress"`
	Diag             Diag   `json:"diag"`
	CoveredReceivers string `json:"coveredReceivers"`
	Site             *Site  `json:"site"`
}

type Channel struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	ComId       string `json:"comId"`
	IPId        string `json:"ipId"`
	MulticastIp string `json:"multicastIp"`
	PortId      string `json:"portId"`
	Port        int    `json:"port"`
}

type Diag struct {
	Height float64 `json:"height"`
	Info   string  `json:"info"`
}

type UpdateDataChannel struct {
	Id    string            `json:"id"`
	Items []KeyValueBoolean `json:"items"`
}

type KeyValueBoolean struct {
	Key   string `json:"key"`
	Value bool   `json:"value"`
}

type DataChannel struct {
	Id                string            `json:"id"`
	OverDetermEnabled bool              `json:"overDetermEnabled"`
	RefTranEnabled    bool              `json:"refTranEnabled"`
	HeightEnabled     bool              `json:"heightEnabled"`
	DataChannel       []DataChannelItem `json:"items"`
}

type DataChannelItem struct {
	Enabled    byte   `json:"enabled"`
	ReceiverId string `json:"receiverId"`
}

type Settings struct {
	LightSpeed float64 `json:"lightSpeed" xml:"LightSpeed"`
}

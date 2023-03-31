package main

type dataProcessing struct {
	Id           string       `xml:"id,attr"`
	DataChannels dataChannels `xml:"DataChannels"`
}

type dataChannels struct {
	DataChannel []dataChannel `xml:"DataChannel"`
}

type dataChannel struct {
	Enabled    byte   `xml:"Enabled"`
	MUChannel  rune   `xml:"MUChannel"`
	ReceiverId string `xml:"ReceiverId"`
}

type site struct {
	Id          string  `xml:"id,attr"`
	Description string  `xml:"Description"`
	Latitude    float64 `xml:"Latitude"`
	Longitude   float64 `xml:"Longitude"`
	Height      float64 `xml:"Height"`
}

type transmitter struct {
	Id               string           `xml:"id,attr"`
	SiteId           string           `xml:"SiteId"`
	TXLUId           string           `xml:"TXLUId"`
	ModeSAddress     string           `xml:"ModeSAddress"`
	CoveredReceivers coveredReceivers `xml:"CoveredReceivers"`
	CoveredAreaId    string           `xml:"CoveredAreaId"`
}

type transponder struct {
	Id               string           `xml:"id,attr"`
	SiteId           string           `xml:"SiteId"`
	ModeSAddress     string           `xml:"ModeSAddress"`
	Diag             diag             `xml:"Diag"`
	CoveredReceivers coveredReceivers `xml:"CoveredReceivers"`
}

type diag struct {
	Height float64 `xml:"Height"`
	Info   string  `xml:"Info"`
}

type coveredReceivers struct {
	ReceiverId []string `xml:"ReceiverId"`
}

type receiver struct {
	Id       string   `xml:"id,attr"`
	SiteId   string   `xml:"SiteId"`
	DataLink dataLink `xml:"DataLink"`
}

type dataLink struct {
	Dual dual `xml:"Dual"`
}

type dual struct {
	A dualItem `xml:"A"`
	B dualItem `xml:"B"`
}

type dualItem struct {
	AddDelaySSR float64 `xml:"AddDelaySSR"`
}

type channels struct {
	Channel []channel `xml:"Channel"`
}

type channel struct {
	Id    string `xml:"id,attr"`
	Name  string `xml:"Name"`
	ComId string `xml:"ComId"`
}

type communications struct {
	Out out  `xml:"Out"`
	Com coms `xml:"Coms"`
	Ip  ip   `xml:"IP"`
}

type ip struct {
	Addresses addresses `xml:"Addresses"`
	Ports     ports     `xml:"Ports"`
}

type ports struct {
	Port []port `xml:"Port"`
}

type port struct {
	Id      string `xml:"id,attr"`
	Content string `xml:",chardata"`
}

type addresses struct {
	Address []address `xml:"Address"`
}

type address struct {
	Id      string `xml:"id,attr"`
	Content string `xml:",chardata"`
}

type out struct {
	Channels channels `xml:"Channels"`
}

type coms struct {
	TcpServer []tcpServer `xml:"TcpServer"`
	TcpClient []tcpClient `xml:"TcpClient"`
	Udp       []udp       `xml:"UDP"`
}

type tcpServer struct {
	Id     string `xml:"id,attr"`
	PortId string `xml:"PortId"`
}

type tcpClient struct {
	Id     string `xml:"id,attr"`
	IPId   string `xml:"IPId"`
	PortId string `xml:"PortId"`
}

type udp struct {
	Id     string `xml:"id,attr"`
	IPId   string `xml:"IPId"`
	PortId string `xml:"PortId"`
}

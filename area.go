package main

import (
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"os"
)

type Areas struct {
	XMLName xml.Name `xml:"Areas"`
	Area    []Area   `xml:"Area" json:"area"`
}

type Area struct {
	XMLName xml.Name `xml:"Area" json:"XMLName"`
	ID      string   `xml:"id,attr" json:"id"`
	Polygon Polygon  `xml:"Polygon,omitempty" json:"polygon"`
	Circle  Circle   `xml:"Circle,omitempty" json:"circle"`
	And     And      `xml:"and,omitempty" json:"and"`
}

type Polygon struct {
	XMLName xml.Name `xml:"Polygon"`
	Point   []Point  `xml:"Point" json:"point"`
}

type Point struct {
	XMLName xml.Name `xml:"Point"`
	Lat     float64  `xml:"Lat" json:"lat"`
	Lon     float64  `xml:"Lon" json:"lon"`
}

type Circle struct {
	XMLName xml.Name `xml:"Circle"`
	Center  Center   `xml:"Center" json:"center"`
	Radius  int      `xml:"Radius" json:"radius"`
}

type Center struct {
	XMLName xml.Name `xml:"Center"`
	Lat     float64  `xml:"Lat" json:"lat"`
	Lon     float64  `xml:"Lon" json:"lon"`
}

type And struct {
	XMLName xml.Name  `xml:"and"`
	AreaId  []string  `xml:"AreaId" json:"areaId"`
	Circle  []Circle  `xml:"Circle" json:"circle"`
	Polygon []Polygon `xml:"Polygon" json:"polygon"`
	Height  []Height  `xml:"Height" json:"height"`
	Not     []Not     `xml:"not" json:"not"`
}

type Height struct {
	XMLName xml.Name `xml:"Height"`
	Between Between  `xml:"Between" json:"between"`
}

type Between struct {
	XMLName xml.Name `xml:"Between"`
	Lower   float64  `xml:"Lower" json:"lower"`
	Upper   float64  `xml:"Upper" json:"upper"`
}

type Not struct {
	XMLName xml.Name  `xml:"not"`
	AreaId  []string  `xml:"AreaId" json:"areaId"`
	Circle  []Circle  `xml:"Circle" json:"circle"`
	Polygon []Polygon `xml:"Polygon" json:"polygon"`
	Height  []Height  `xml:"Height" json:"height"`
}

func decodeAreas(filename string) (Areas, error) {
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println("Error opening XML file:", err)
		return Areas{}, err
	}
	defer file.Close()

	areas := Areas{}
	decoder := xml.NewDecoder(file)
	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("error getting token: %v\n", err)
			return Areas{}, err
		}
		switch v := token.(type) {
		case xml.StartElement:
			if v.Name.Local == "Areas" {
				if err = decoder.DecodeElement(&areas, &v); err != nil {
					fmt.Println("Error decoding Areas:", err)
					return Areas{}, err
				}
				continue
			}
		}
	}

	return areas, nil
}

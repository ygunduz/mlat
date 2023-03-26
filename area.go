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
	XMLName xml.Name `xml:"and"`
	AreaId  []string `xml:"AreaId" json:"areaId"`
	Not     []Not    `xml:"not" json:"not"`
}

type Not struct {
	XMLName xml.Name `xml:"not"`
	AreaId  string   `xml:"AreaId" json:"areaId"`
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

	//fmt.Printf("Number of areas: %d\n", len(areas.Area))
	//for _, area := range areas.Area {
	//	fmt.Printf("Area ID: %s\n", area.ID)
	//	if area.Polygon.Point != nil {
	//		fmt.Printf("Polygon points: %v\n", area.Polygon.Point)
	//	} else if area.Circle.Center.Lat != 0 && area.Circle.Center.Lon != 0 {
	//		fmt.Printf("Circle center: (%f, %f)\n", area.Circle.Center.Lat, area.Circle.Center.Lon)
	//		fmt.Printf("Circle radius: %d\n", area.Circle.Radius)
	//	} else if len(area.And.AreaId) > 0 {
	//		fmt.Printf("And operator: %v\n", area.And.AreaId)
	//		if len(area.And.Not) > 0 {
	//			fmt.Printf("Not operator: %v\n", area.And.Not)
	//		}
	//	}
	//	fmt.Println()
	//}
	return areas, nil
}

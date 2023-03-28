import {GetAreas as _GetAreas} from "../../wailsjs/go/main/App";
import {union, lineToPolygon, circle, lineString, difference} from "@turf/turf"
import {main} from "../../wailsjs/go/models";
import Area = main.Area;
import {Feature, MultiPolygon, Polygon} from "@turf/helpers";
import Circle = main.Circle;
import TPolygon = main.Polygon;

export interface AreaType {
    id: string,
    color: string,
    shape: Feature<Polygon | MultiPolygon>
}

const colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

const setColor = (area: Feature<any>, color: string) => {
    area.properties.fill = color;
    area.properties.stroke = color;
}

const _circle = (id: string, c: Circle, color: string) => {
    const center = [c.center.lon, c.center.lat]
    const radius = c.radius
    return {id: id, shape: circle(center, radius, {units: 'meters', properties: {fill: color, stroke: color}}), color: color}
}

const _polygon = (id: string, p: TPolygon, color: string) => {
    const points = p.point.map((point) => {
        return [point.lon, point.lat]
    })
    return {id, shape: lineToPolygon(lineString([...points]), {properties: {fill: color, stroke: color}}), color: color}
}

const processAreaIds = (areas: Area[], areaIds: string[], a: Feature<any> = null, color: string, method: any) => {
    if(areaIds && areaIds.length > 0) {
        const list = areas.filter((b) => areaIds.includes(b.id))
        const processedAreas = processAreas(list);
        if (a === null) {
            a = processedAreas[0].shape;
            for (let i = 1; i < processedAreas.length; i++) {
                a = method(a, processedAreas[i].shape, {properties: {fill: color, stroke: color}})
            }
        } else {
            for (let i = 0; i < processedAreas.length; i++) {
                a = method(a, processedAreas[i].shape, {properties: {fill: color, stroke: color}})
            }
        }
    }
    return a;
}

const processCircle = (circles: Circle[], a: Feature<any> = null, color: string, method: any) => {
    if (circles && circles.length > 0) {
        if(a === null) {
            a = _circle(null, circles[0], color).shape;
            for (let i = 1; i < circles.length; i++) {
                a = method(a, _circle(null, circles[i], color).shape, {properties: {fill: color, stroke: color}})
            }
        } else {
            for (let i = 0; i < circles.length; i++) {
                a = method(a, _circle(null, circles[i], color).shape, {properties: {fill: color, stroke: color}})
            }
        }
    }
    return a;
}

const processPolygon = (polygons: TPolygon[], a: Feature<any> = null, color: string, method: any) => {
    if (polygons && polygons.length > 0) {
        if(a === null) {
            a = _polygon(null, polygons[0], color).shape;
            for (let i = 1; i < polygons.length; i++) {
                a = method(a, _polygon(null, polygons[i], color).shape, {properties: {fill: color, stroke: color}})
            }
        } else {
            for (let i = 0; i < polygons.length; i++) {
                a = method(a, _polygon(null, polygons[i], color).shape, {properties: {fill: color, stroke: color}})
            }
        }
    }
    return a;
}

const processAreas = (areas: Area[]): Array<AreaType | null> => {
    return areas.map((area, index) => {
        if (area.polygon?.point && area.polygon.point.length > 0) {
            return _polygon(area.id, area.polygon, colorArray[index])
        } else if (area.circle?.center?.lat && area.circle?.center?.lon) {
            return _circle(area.id, area.circle, colorArray[index]);
        } else if (area.and) {
            let a: Feature<any> = null;
            a = processAreaIds(areas, area.and.areaId, a, colorArray[index], union)
            a = processCircle(area.and.circle, a, colorArray[index], union);
            a = processPolygon(area.and.polygon, a, colorArray[index], union);
            if (area.and.not) {
                area.and.not.forEach((not) => {
                    a = processAreaIds(areas, not.areaId, a, colorArray[index], difference);
                    a = processCircle(not.circle, a, colorArray[index], difference);
                    a = processPolygon(not.polygon, a, colorArray[index], difference);
                })
            }
            setColor(a, colorArray[index])
            return {id: area.id, shape: a, color: colorArray[index]}
        }
    })
}

export const GetAreas = () : Promise<Array<AreaType | null>> => {
    return new Promise((resolve, reject) => {
        _GetAreas().then((areas) => {
            try {
                resolve(processAreas(areas.area))
            } catch (e) {
                reject(e)
            }
        }).catch((err) => {
            reject(err)
        })
    })
}

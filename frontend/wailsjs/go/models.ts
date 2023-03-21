export namespace main {
	
	export class DataChannelItem {
	    enabled: number;
	    receiverId: string;
	
	    static createFrom(source: any = {}) {
	        return new DataChannelItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.receiverId = source["receiverId"];
	    }
	}
	export class DataChannel {
	    id: string;
	    items: DataChannelItem[];
	
	    static createFrom(source: any = {}) {
	        return new DataChannel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.items = this.convertValues(source["items"], DataChannelItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Diag {
	    height: number;
	    info: string;
	
	    static createFrom(source: any = {}) {
	        return new Diag(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.height = source["height"];
	        this.info = source["info"];
	    }
	}
	export class Transponder {
	    id: string;
	    siteId: string;
	    modeSAddress: string;
	    diag: Diag;
	    coveredReceivers: string;
	    site?: Site;
	
	    static createFrom(source: any = {}) {
	        return new Transponder(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.siteId = source["siteId"];
	        this.modeSAddress = source["modeSAddress"];
	        this.diag = this.convertValues(source["diag"], Diag);
	        this.coveredReceivers = source["coveredReceivers"];
	        this.site = this.convertValues(source["site"], Site);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Transmitter {
	    id: string;
	    siteId: string;
	    txluId: string;
	    modeSAddress: string;
	    coveredReceivers: string;
	    site?: Site;
	    coveredAreaId: string;
	
	    static createFrom(source: any = {}) {
	        return new Transmitter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.siteId = source["siteId"];
	        this.txluId = source["txluId"];
	        this.modeSAddress = source["modeSAddress"];
	        this.coveredReceivers = source["coveredReceivers"];
	        this.site = this.convertValues(source["site"], Site);
	        this.coveredAreaId = source["coveredAreaId"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Receiver {
	    id: string;
	    siteId: string;
	    addDelaySSRA: number;
	    addDelaySSRB: number;
	    site?: Site;
	    cableLengthA: number;
	    cableLengthB: number;
	
	    static createFrom(source: any = {}) {
	        return new Receiver(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.siteId = source["siteId"];
	        this.addDelaySSRA = source["addDelaySSRA"];
	        this.addDelaySSRB = source["addDelaySSRB"];
	        this.site = this.convertValues(source["site"], Site);
	        this.cableLengthA = source["cableLengthA"];
	        this.cableLengthB = source["cableLengthB"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Site {
	    id: string;
	    description: string;
	    latitude: number;
	    longitude: number;
	    height: number;
	
	    static createFrom(source: any = {}) {
	        return new Site(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.description = source["description"];
	        this.latitude = source["latitude"];
	        this.longitude = source["longitude"];
	        this.height = source["height"];
	    }
	}
	export class Container {
	    sites: Site[];
	    receivers: Receiver[];
	    transmitters: Transmitter[];
	    transponders: Transponder[];
	    dataChannels: DataChannel[];
	
	    static createFrom(source: any = {}) {
	        return new Container(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sites = this.convertValues(source["sites"], Site);
	        this.receivers = this.convertValues(source["receivers"], Receiver);
	        this.transmitters = this.convertValues(source["transmitters"], Transmitter);
	        this.transponders = this.convertValues(source["transponders"], Transponder);
	        this.dataChannels = this.convertValues(source["dataChannels"], DataChannel);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	export class KeyValueBoolean {
	    key: string;
	    value: boolean;
	
	    static createFrom(source: any = {}) {
	        return new KeyValueBoolean(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	    }
	}
	
	export class Settings {
	    lightSpeed: number;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.lightSpeed = source["lightSpeed"];
	    }
	}
	
	
	
	export class UpdateDataChannel {
	    id: string;
	    items: KeyValueBoolean[];
	
	    static createFrom(source: any = {}) {
	        return new UpdateDataChannel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.items = this.convertValues(source["items"], KeyValueBoolean);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}


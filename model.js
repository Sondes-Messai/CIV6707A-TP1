class Bus {
  constructor(obj) {
    this.id = obj.id;
    this.license = obj.license;
    this.make = obj.make;
    this.model = obj.model;
    this.seatCount = obj.seatCount;
    this.standingCapacity = obj.standingCapacity;
    this.doorCount = obj.doorCount;
    this.accessCount = obj.accessCount;
  }
}

class Agency {
  constructor(obj) {
    this.name = obj.name;
    this.shortName = obj.shortName;
    this.busInventory = obj.busInventory || []; // Default to an empty list if busInvestory is not specified.
  }

  _getBusByAttribute(attribute, value) {
    return this.busInventory.find(obj => {
      return obj[attribute] === value
    });    
  }

  getBusById(id) {
    return this._getBusByAttribute('id', id);
  }

  getBusByLicense(license) {
    return this._getBusByAttribute('license', license);
  }

  addBusToInventory(bus) {
    if (this.getBusById(bus.id) != undefined) {
      throw "A bus with same ID already exists in the agency's inventory.";
    } else {
      this.busInventory.push(bus);
    }
  }

  removeBusFromInventory(bus) {
    const idx = this.busInventory.indexOf(bus);
    if (idx === -1) {
      throw "this bus is not in the agency's inventory";
    } else {
      this.busInventory.splice(idx, 1)
    }
  }
}

export {Bus, Agency};
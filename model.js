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
}

export {Bus, Agency};
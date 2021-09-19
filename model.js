class Bus {
  constructor(id, license, make, model, seatCount, standingCapacity, doorCount, accessCount) {
    this.id = id;
    this.license = license;
    this.make = make;
    this.model = model;
    this.seatCount = seatCount;
    this.standingCapacity = standingCapacity;
    this.doorCount = doorCount;
    this.accessCount = accessCount;
  }
}

class Agency {
  constructor(name, shortName, busInventory) {
    this.name = name;
    this.shortName = shortName;
    this.busInventory = busInventory || []; // Default to an empty list if busInvestory is not specified.
  }
}
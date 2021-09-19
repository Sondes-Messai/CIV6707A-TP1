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
  constructor(name, shortname, busInventory) {
    this.name = name;
    this.shortname = shortname;
    this.busInventory = busInventory;
  }
}
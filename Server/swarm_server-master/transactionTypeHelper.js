const typeKeys = {
  Ordered: 1,
  Started: 2,
  Helped: 3,
  Completed: 4,
  Error: 5,
  Canceled: 6,
};

const types = {
  [typeKeys.Ordered]: "Admin ordered tires from the location",
  [typeKeys.Started]: "Duty started",
  [typeKeys.Helped]: "Asked for help",
  [typeKeys.Completed]: "Duty completed",
  [typeKeys.Error]: "An error occured",
  [typeKeys.Canceled]: "Duty canceled",
};

module.exports = { typeKeys, types };

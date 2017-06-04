CREATE TABLE morningCommute (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR (50) NOT NULL,
  start VARCHAR(200) NOT NULL,
  dest VARCHAR(200) NOT NULL,
  timehrs VARCHAR(2) NOT NULL,
  timemins VARCHAR(2) NOT NULL,
  timeampm VARCHAR(2) NOT NULL
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR (25) NOT NULL,
  email VARCHAR (50) NOT NULL,
  zip VARCHAR (6) NOT NULL,
  description VARCHAR(50) NOT NULL,
  date TIMESTAMP
);

CREATE TABLE commuteInfo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR (50) NOT NULL,
  start VARCHAR(200) NOT NULL,
  end VARCHAR(200) NOT NULL,
  arrivalTime VARCHAR(10) NOT NULL,
  departureTime VARCHAR(10) NOT NULL,
  startCoords JSON,
  endCoords JSON,
  date TIMESTAMP
);

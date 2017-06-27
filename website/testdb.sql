CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR (25) NOT NULL,
  email VARCHAR (50) NOT NULL,
  zip VARCHAR (6)NULL,
  phone varchar(17)NULL,
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

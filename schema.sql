CREATE TABLE routes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR (50) NOT NULL,
  start VARCHAR(200) NOT NULL,
  starttime VARCHAR(50) NOT NULL,
  dest VARCHAR(200) NOT NULL,
  desttime VARCHAR(50) NOT NULL
);

CREATE TABLE morningCommute (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR (50) NOT NULL,
  start VARCHAR(200) NOT NULL,
  dest VARCHAR(200) NOT NULL,
  timehrs VARCHAR(2) NOT NULL,
  timemins VARCHAR(2) NOT NULL,
  timeampm VARCHAR(2) NOT NULL
);

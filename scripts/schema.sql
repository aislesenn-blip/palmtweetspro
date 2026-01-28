-- Table A: Locations (GeoNames allCountries)
CREATE TABLE IF NOT EXISTS locations (
    geoname_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    asciiname TEXT,
    alternatenames TEXT,
    latitude REAL,
    longitude REAL,
    feature_class TEXT,
    feature_code TEXT,
    country_code TEXT,
    admin1_code TEXT,
    admin2_code TEXT,
    population INTEGER,
    timezone TEXT
);

-- Indexes for Locations
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country_code);
CREATE INDEX IF NOT EXISTS idx_locations_lat_lon ON locations(latitude, longitude);

-- Table B: Postcodes (GeoNames zipCodes)
CREATE TABLE IF NOT EXISTS postcodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_code TEXT,
    postal_code TEXT,
    place_name TEXT,
    admin_name1 TEXT,
    admin_name2 TEXT,
    latitude REAL,
    longitude REAL
);

-- Indexes for Postcodes
CREATE INDEX IF NOT EXISTS idx_postcodes_code ON postcodes(postal_code);
CREATE INDEX IF NOT EXISTS idx_postcodes_place ON postcodes(place_name);
CREATE INDEX IF NOT EXISTS idx_postcodes_country_code ON postcodes(country_code, postal_code);

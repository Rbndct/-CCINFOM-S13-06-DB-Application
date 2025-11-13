DROP DATABASE IF EXISTS wedding_management_db;
CREATE DATABASE wedding_management_db;
USE wedding_management_db;

DROP TABLE IF EXISTS inventory_allocation;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS package_menu_items;
DROP TABLE IF EXISTS recipe;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS menu_item;
DROP TABLE IF EXISTS table_package;
DROP TABLE IF EXISTS package;
DROP TABLE IF EXISTS guest;
DROP TABLE IF EXISTS seating_table;
DROP TABLE IF EXISTS dietary_restriction;
DROP TABLE IF EXISTS couple_preferences;
DROP TABLE IF EXISTS wedding;
DROP TABLE IF EXISTS couple;

CREATE TABLE couple (
    couple_id INT AUTO_INCREMENT PRIMARY KEY,
    partner1_name VARCHAR(255) NOT NULL,
    partner2_name VARCHAR(255) NOT NULL,
    partner1_phone VARCHAR(50) NOT NULL,
    partner2_phone VARCHAR(50) NOT NULL,
    partner1_email VARCHAR(255) NOT NULL,
    partner2_email VARCHAR(255) NOT NULL,
    planner_contact VARCHAR(255) NOT NULL
);


CREATE TABLE dietary_restriction (
    restriction_id INT AUTO_INCREMENT PRIMARY KEY,
    restriction_name VARCHAR(255) NOT NULL,
    severity_level VARCHAR(50) NOT NULL,
    restriction_type VARCHAR(50) NOT NULL
);



CREATE TABLE couple_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    couple_id INT NOT NULL,
    ceremony_type VARCHAR(100) NOT NULL,
    restriction_id INT NOT NULL,
    FOREIGN KEY (couple_id) REFERENCES couple(couple_id) ON DELETE CASCADE,
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id)
);


CREATE TABLE wedding (
    wedding_id INT PRIMARY KEY AUTO_INCREMENT,
    couple_id INT NOT NULL,
    guest_count INT,
    total_cost DECIMAL(10,2),
    production_cost DECIMAL(10,2),
    venue VARCHAR(255) NOT NULL,
    wedding_date DATE NOT NULL,
    wedding_time TIME NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    FOREIGN KEY (couple_id) REFERENCES couple(couple_id) ON DELETE CASCADE
);


CREATE TABLE seating_table (
    table_id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    table_number VARCHAR(50),
    table_category VARCHAR(100),
    capacity INT,
    FOREIGN KEY (wedding_id) REFERENCES wedding(wedding_id) ON DELETE CASCADE
);



CREATE TABLE guest (
    guest_id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    table_id INT,
    restriction_id INT,
    rsvp_status VARCHAR(50) NOT NULL,
    FOREIGN KEY (wedding_id) REFERENCES wedding(wedding_id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES seating_table(table_id),
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id)
);

CREATE TABLE menu_item (
    menu_item_id INT AUTO_INCREMENT PRIMARY KEY,
    menu_name VARCHAR(255) NOT NULL,
    menu_cost DECIMAL(10,2) NOT NULL,
    menu_price DECIMAL(10,2) NOT NULL,
    menu_type VARCHAR(100) NOT NULL,
    stock INT NOT NULL,
    restriction_id INT,
    FOREIGN KEY (restriction_id) REFERENCES dietary_restriction(restriction_id)
);

CREATE TABLE ingredient (
    ingredient_id INT PRIMARY KEY NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    stock_quantity DECIMAL(10,2) NOT NULL,
    re_order_level VARCHAR(50) NOT NULL
);

CREATE TABLE recipe (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity_needed DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (menu_item_id) REFERENCES menu_item(menu_item_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id),
    UNIQUE (menu_item_id, ingredient_id)
);

CREATE TABLE package (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(100) NOT NULL,
    package_price DECIMAL(10,2) NOT NULL
);


CREATE TABLE package_menu_items (
    package_menu_id INT PRIMARY KEY AUTO_INCREMENT,
    package_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (package_id) REFERENCES package(package_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_item(menu_item_id)
);


CREATE TABLE table_package (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    package_id INT NOT NULL,
    FOREIGN KEY (table_id) REFERENCES seating_table(table_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES package(package_id)
);


CREATE TABLE inventory_items (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    item_condition VARCHAR(50) NOT NULL,
    quantity_available INT NOT NULL,
    rental_cost DECIMAL(10,2) NOT NULL
);

CREATE TABLE inventory_allocation (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    wedding_id INT NOT NULL,
    inventory_id INT NOT NULL,
    quantity_used INT NOT NULL,
    rental_cost DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (wedding_id) REFERENCES wedding(wedding_id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory_items(inventory_id)
);
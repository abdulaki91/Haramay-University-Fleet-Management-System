-- Add fuel_capacity column to vehicles table for better fuel monitoring
ALTER TABLE vehicles ADD COLUMN fuel_capacity DECIMAL(5, 2) DEFAULT 50.00 COMMENT 'Fuel tank capacity in liters';

-- Update existing vehicles with estimated fuel capacity based on vehicle type
UPDATE vehicles SET fuel_capacity = 
  CASE 
    WHEN type LIKE '%truck%' OR type LIKE '%bus%' THEN 80.00
    WHEN type LIKE '%van%' THEN 60.00
    WHEN type LIKE '%suv%' THEN 70.00
    WHEN fuel_type = 'electric' THEN 0.00
    ELSE 50.00
  END
WHERE fuel_capacity IS NULL OR fuel_capacity = 0;
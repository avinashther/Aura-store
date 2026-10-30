-- Bottoms now use waist sizes (28, 30, 32) instead of S / M / L / XL.
-- Sample products are converted: S -> 28, M -> 30, L -> 32. XL has no match, so it is removed.
DELETE FROM "Variant"
WHERE "size" = 'XL' AND "productId" IN (SELECT "id" FROM "Product" WHERE "category" = 'bottoms');

UPDATE "Variant"
SET "size" = CASE "size" WHEN 'S' THEN '28' WHEN 'M' THEN '30' WHEN 'L' THEN '32' END
WHERE "size" IN ('S', 'M', 'L') AND "productId" IN (SELECT "id" FROM "Product" WHERE "category" = 'bottoms');

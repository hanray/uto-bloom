# Revert fenestration/split changes
# Run this if you don't like the results

Write-Host "Reverting fenestration and split mask changes..." -ForegroundColor Yellow

# Restore backup
Copy-Item "e:\E\Creative Work\Backend Dev\UtoBloom\client\src\utils\plantGeneration\createOrganicLeafGeometry.js.backup" `
          "e:\E\Creative Work\Backend Dev\UtoBloom\client\src\utils\plantGeneration\createOrganicLeafGeometry.js" -Force

Write-Host "✓ Restored createOrganicLeafGeometry.js" -ForegroundColor Green
Write-Host ""
Write-Host "Note: You'll also need to manually remove the mask code from:" -ForegroundColor Cyan
Write-Host "  - SDFLeafBase_CLEAN.js (remove aFenMask, aSplitMask attributes and discard)" -ForegroundColor Gray
Write-Host "  - SDFLeafEmissive_CLEAN.js (remove aFenMask, aSplitMask attributes and discard)" -ForegroundColor Gray
Write-Host "  - ProceduralPlant.jsx (remove fenCount, fenSize, splitCount, splitDepth params)" -ForegroundColor Gray

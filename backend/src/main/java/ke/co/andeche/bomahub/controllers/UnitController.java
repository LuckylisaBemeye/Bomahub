package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.models.Unit;
import ke.co.andeche.bomahub.services.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/units")
public class UnitController {
    private final UnitService unitService;

    @Autowired
    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @GetMapping
    public ResponseEntity<List<Unit>> getAllUnits() {
        return ResponseEntity.ok(unitService.getAllUnits());
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Unit>> getUnitsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(unitService.getUnitsByProperty(propertyId));
    }

    @GetMapping("/property/{propertyId}/status/{status}")
    public ResponseEntity<List<Unit>> getUnitsByPropertyAndStatus(
            @PathVariable Long propertyId,
            @PathVariable String status) {
        return ResponseEntity.ok(unitService.getUnitsByPropertyAndStatus(propertyId, status));
    }

    @GetMapping("/floor/{floorId}")
    public ResponseEntity<List<Unit>> getUnitsByFloor(@PathVariable Long floorId) {
        return ResponseEntity.ok(unitService.getUnitsByFloor(floorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Unit> getUnitById(@PathVariable Long id) {
        return unitService.getUnitById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Unit> createUnit(@RequestBody Unit unit) {
        try {
            Unit createdUnit = unitService.createUnit(unit);
            return ResponseEntity.ok(createdUnit);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Unit> updateUnit(@PathVariable Long id, @RequestBody Unit unit) {
        Optional<Unit> existingUnit = unitService.getUnitById(id);
        if (existingUnit.isPresent()) {
            unit.setId(id);
            try {
                Unit updatedUnit = unitService.updateUnit(unit);
                return ResponseEntity.ok(updatedUnit);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUnit(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            unitService.deleteUnit(id);
            response.put("success", true);
            response.put("message", "Unit deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<Unit> updateUnitStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        Optional<Unit> existingUnit = unitService.getUnitById(id);
        if (existingUnit.isPresent()) {
            Unit unit = existingUnit.get();
            unit.setStatus(statusUpdate.get("status"));
            try {
                Unit updatedUnit = unitService.updateUnit(unit);
                return ResponseEntity.ok(updatedUnit);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

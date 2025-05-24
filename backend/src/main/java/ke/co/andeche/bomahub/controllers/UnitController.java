package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.models.Unit;
import ke.co.andeche.bomahub.services.UnitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/units")
public class UnitController {
    private final UnitService unitService;

    @Autowired
    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @GetMapping
    public List<Unit> getAllUnits() {
        return unitService.getAllUnits();
    }

    @GetMapping("/property/{propertyId}")
    public List<Unit> getUnitsByProperty(@PathVariable Long propertyId) {
        return unitService.getUnitsByProperty(propertyId);
    }

    @GetMapping("/property/{propertyId}/status/{status}")
    public List<Unit> getUnitsByPropertyAndStatus(
            @PathVariable Long propertyId,
            @PathVariable String status) {
        return unitService.getUnitsByPropertyAndStatus(propertyId, status);
    }

    @GetMapping("/floor/{floorId}")
    public List<Unit> getUnitsByFloor(@PathVariable Long floorId) {
        return unitService.getUnitsByFloor(floorId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Unit> getUnitById(@PathVariable Long id) {
        return unitService.getUnitById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Unit createUnit(@RequestBody Unit unit) {
        return unitService.createUnit(unit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Unit> updateUnit(@PathVariable Long id, @RequestBody Unit unit) {
        return unitService.getUnitById(id)
                .map(existingUnit -> {
                    unit.setId(id);
                    return ResponseEntity.ok(unitService.updateUnit(unit));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Unit> updateUnitStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {

        String newStatus = statusUpdate.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return unitService.getUnitById(id)
                .map(existingUnit -> {
                    existingUnit.setStatus(newStatus);
                    return ResponseEntity.ok(unitService.updateUnit(existingUnit));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        return unitService.getUnitById(id)
                .map(unit -> {
                    unitService.deleteUnit(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.models.Floor;
import ke.co.andeche.bomahub.repositories.FloorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/floors")
public class FloorController {
    private final FloorRepository floorRepository;

    @Autowired
    public FloorController(FloorRepository floorRepository) {
        this.floorRepository = floorRepository;
    }

    @GetMapping
    public List<Floor> getAllFloors() {
        return floorRepository.findAll();
    }

    @GetMapping("/property/{propertyId}")
    public List<Floor> getFloorsByProperty(@PathVariable Long propertyId) {
        return floorRepository.findByPropertyId(propertyId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Floor> getFloorById(@PathVariable Long id) {
        return floorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Floor createFloor(@RequestBody Floor floor) {
        return floorRepository.save(floor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Floor> updateFloor(@PathVariable Long id, @RequestBody Floor floor) {
        return floorRepository.findById(id)
                .map(existingFloor -> {
                    floor.setId(id);
                    return ResponseEntity.ok(floorRepository.save(floor));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFloor(@PathVariable Long id) {
        return floorRepository.findById(id)
                .map(floor -> {
                    floorRepository.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

}

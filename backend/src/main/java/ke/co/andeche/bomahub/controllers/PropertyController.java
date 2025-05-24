package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.dto.CreatePropertyRequest;
import ke.co.andeche.bomahub.models.Property;
import ke.co.andeche.bomahub.services.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    private final PropertyService propertyService;

    @Autowired
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<Property>> getPropertiesByOrganization(@PathVariable Long organizationId) {
        return ResponseEntity.ok(propertyService.getPropertiesByOrganization(organizationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        return propertyService.getPropertyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        Property createdProperty = propertyService.createProperty(property);
        return ResponseEntity.ok(createdProperty);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(@PathVariable Long id, @RequestBody Property property) {
        return propertyService.getPropertyById(id)
                .map(existingProperty -> {
                    property.setId(id);
                    return ResponseEntity.ok(propertyService.updateProperty(property));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        return propertyService.getPropertyById(id)
                .map(property -> {
                    propertyService.deleteProperty(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create-property")
    public ResponseEntity<Map<String, Object>> createPropertyWithStructure(
            @RequestBody CreatePropertyRequest request) {
        try {
            propertyService.createPropertyWithStructure(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Property created successfully with floors and units");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating property: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}

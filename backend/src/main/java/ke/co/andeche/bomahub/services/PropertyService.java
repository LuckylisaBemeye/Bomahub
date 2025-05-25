package ke.co.andeche.bomahub.services;

import ke.co.andeche.bomahub.dto.CreatePropertyRequest;
import ke.co.andeche.bomahub.models.Floor;
import ke.co.andeche.bomahub.models.Property;
import ke.co.andeche.bomahub.models.Unit;
import ke.co.andeche.bomahub.repositories.FloorRepository;
import ke.co.andeche.bomahub.repositories.PropertyRepository;
import ke.co.andeche.bomahub.repositories.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PropertyService {
    private final PropertyRepository propertyRepository;
    private final UnitService unitService;
    private final FloorRepository floorRepository;
    private final UnitRepository unitRepository;

    @Autowired
    public PropertyService(
            PropertyRepository propertyRepository,
            UnitService unitService,
            FloorRepository floorRepository,
            UnitRepository unitRepository) {
        this.propertyRepository = propertyRepository;
        this.unitService = unitService;
        this.floorRepository = floorRepository;
        this.unitRepository = unitRepository;
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public List<Property> getPropertiesByOrganization(Long organizationId) {
        return propertyRepository.findByOrganizationId(organizationId);
    }

    public Optional<Property> getPropertyById(Long id) {
        return propertyRepository.findById(id);
    }

    public Property createProperty(Property property) {
        return propertyRepository.save(property);
    }

    public Property updateProperty(Property property) {
        return propertyRepository.save(property);
    }

    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
    }

    @Transactional
    public void createPropertyWithStructure(CreatePropertyRequest request) {
        // Create the property
        Property property = new Property();
        property.setName(request.getPropertyName());
        property.setAddress(request.getPropertyAddress());
        property.setType("RESIDENTIAL"); // Default type

        Property savedProperty = propertyRepository.save(property);

        // Create floors and units
        createFloorsWithUnits(savedProperty, request);
    }

    private void createFloorsWithUnits(Property property, CreatePropertyRequest request) {
        // Create standard floors
        for (int i = 0; i < request.getFloorCount(); i++) {
            Floor floor = new Floor();
            floor.setName(String.valueOf(Character.toChars(65 + request.getStartFloor() + i - 1)[0])); // A, B, C...
            floor.setProperty(property);

            Floor savedFloor = floorRepository.save(floor);

            // Create units for this floor
            for (int j = 1; j <= request.getUnitsPerFloor(); j++) {
                Unit unit = new Unit();
                unit.setUnitNumber(savedFloor.getName() + String.format("%02d", j)); // A01, A02, etc.
                unit.setStatus("available");
                unit.setProperty(property);
                unit.setFloor(savedFloor);

                unitRepository.save(unit);
            }
        }

        // Create custom floor if specified
        if (request.getCustomFloorUnits() != null && request.getCustomFloorUnits() > 0) {
            Floor customFloor = new Floor();
            customFloor.setName(String.valueOf(Character.toChars(65 + request.getFloorCount() + request.getStartFloor() - 1)[0]));
            customFloor.setProperty(property);

            Floor savedCustomFloor = floorRepository.save(customFloor);

            // Create custom units
            for (int j = 1; j <= request.getCustomFloorUnits(); j++) {
                Unit unit = new Unit();
                unit.setUnitNumber(savedCustomFloor.getName() + String.format("%02d", j));
                unit.setStatus("available");
                unit.setProperty(property);
                unit.setFloor(savedCustomFloor);

                unitRepository.save(unit);
            }
        }
    }
}

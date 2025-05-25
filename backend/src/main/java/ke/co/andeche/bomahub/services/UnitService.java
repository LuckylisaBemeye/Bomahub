package ke.co.andeche.bomahub.services;

import ke.co.andeche.bomahub.models.Unit;
import ke.co.andeche.bomahub.repositories.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UnitService {
    private final UnitRepository unitRepository;

    @Autowired
    public UnitService(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    public List<Unit> getUnitsByProperty(Long propertyId) {
        return unitRepository.findByPropertyId(propertyId);
    }

    public List<Unit> getUnitsByPropertyAndStatus(Long propertyId, String status) {
        return unitRepository.findByPropertyIdAndStatus(propertyId, status);
    }

    public List<Unit> getUnitsByFloor(Long floorId) {
        return unitRepository.findByFloorId(floorId);
    }

    public Optional<Unit> getUnitById(Long id) {
        return unitRepository.findById(id);
    }

    public Unit createUnit(Unit unit) {
        return unitRepository.save(unit);
    }

    public Unit updateUnit(Unit unit) {
        return unitRepository.save(unit);
    }

    public void deleteUnit(Long id) {
        unitRepository.deleteById(id);
    }

    public long countByPropertyAndStatus(Long propertyId, String status) {
        return unitRepository.countByPropertyIdAndStatus(propertyId, status);
    }
}

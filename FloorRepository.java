package ke.co.andeche.bomahub.repositories;

import ke.co.andeche.bomahub.models.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {
    List<Floor> findByPropertyId(Long propertyId);
}


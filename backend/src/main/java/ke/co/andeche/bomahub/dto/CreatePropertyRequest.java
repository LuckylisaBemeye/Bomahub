package ke.co.andeche.bomahub.dto;

import lombok.Data;

@Data
public class CreatePropertyRequest {
    private String propertyName;
    private String propertyAddress;
    private Integer floorCount;
    private Integer unitsPerFloor;
    private Double defaultRent;
    private Integer startFloor = 1;
    private Integer customFloorUnits;
    private Double customFloorRent;
}
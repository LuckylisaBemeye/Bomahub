package ke.co.andeche.bomahub.config;

import ke.co.andeche.bomahub.models.Organization;
import ke.co.andeche.bomahub.repositories.OrganizationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private final OrganizationRepository organizationRepository;

    public DataInitializer(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        initializeOrganizations();
    }

    private void initializeOrganizations() {
        // Only initialize if no organizations exist
        if (organizationRepository.count() == 0) {
            System.out.println("Initializing demo organizations...");

            // Create ABC Property Management
            Organization org1 = new Organization();
            org1.setName("ABC Property Management");
            org1.setVerificationCode("ABC123");
            org1.setEmail("admin@abc.com");
            org1.setAddress("123 Main Street, City, State 12345");
            org1.setPhone("555-0123");
            organizationRepository.save(org1);

            // Create XYZ Real Estate
            Organization org2 = new Organization();
            org2.setName("XYZ Real Estate");
            org2.setVerificationCode("XYZ456");
            org2.setEmail("admin@xyz.com");
            org2.setAddress("456 Oak Avenue, City, State 67890");
            org2.setPhone("555-0456");
            organizationRepository.save(org2);

            System.out.println("Demo organizations initialized successfully!");
            System.out.println("- ABC Property Management (Code: ABC123)");
            System.out.println("- XYZ Real Estate (Code: XYZ456)");
        }
    }
}


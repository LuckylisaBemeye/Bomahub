package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.models.Organization;
import ke.co.andeche.bomahub.repositories.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationRepository organizationRepository;

    @Autowired
    public OrganizationController(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @GetMapping
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organization> getOrganizationById(@PathVariable Long id) {
        return organizationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/verify/{code}")
    public ResponseEntity<Organization> getOrganizationByVerificationCode(@PathVariable String code) {
        return organizationRepository.findByVerificationCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Organization createOrganization(@RequestBody Organization organization) {
        return organizationRepository.save(organization);
    }

//    @PostMapping("/register")
//    public ResponseEntity<?> registerOrganization(@RequestBody OrganizationRegistrationRequest request) {
//        // Generate verification code
//        String verificationCode = generateVerificationCode();
//
//        Organization organization = new Organization();
//        organization.setName(request.getName());
//        organization.setAddress(request.getAddress());
//        organization.setPhone(request.getPhone());
//        organization.setEmail(request.getEmail());
//        organization.setVerificationCode(verificationCode);
//
//        Organization saved = organizationRepository.save(organization);
//
//        // Return organization with verification code
//        Map<String, Object> response = new HashMap<>();
//        response.put("organization", saved);
//        response.put("verificationCode", verificationCode);
//        response.put("message", "Organization registered successfully. Use this verification code for user registration.");
//
//        return ResponseEntity.ok(response);
//    }

    @PutMapping("/{id}")
    public ResponseEntity<Organization> updateOrganization(@PathVariable Long id, @RequestBody Organization organization) {
        return organizationRepository.findById(id)
                .map(existingOrg -> {
                    organization.setId(id);
                    return ResponseEntity.ok(organizationRepository.save(organization));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable Long id) {
        return organizationRepository.findById(id)
                .map(org -> {
                    organizationRepository.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

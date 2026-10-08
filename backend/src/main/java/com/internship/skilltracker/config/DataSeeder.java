package com.internship.skilltracker.config;

import com.internship.skilltracker.entity.Role;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.entity.CareerRole;
import com.internship.skilltracker.entity.Department;
import com.internship.skilltracker.repository.CareerRoleRepository;
import com.internship.skilltracker.repository.DepartmentRepository;
import com.internship.skilltracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CareerRoleRepository careerRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminPassword;

    public DataSeeder(UserRepository userRepository, DepartmentRepository departmentRepository,
                      CareerRoleRepository careerRoleRepository, PasswordEncoder passwordEncoder,
                      @Value("${app.admin.password:}") String adminPassword) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.careerRoleRepository = careerRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@skilltracker.com")) {
            if (adminPassword.isBlank()) {
                logger.warn("Admin seed skipped. Set SKILLTRACKER_ADMIN_PASSWORD to create the local admin account.");
            } else {
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@skilltracker.com");
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }
        }

        seedDepartments();
        seedCareerRoles();
    }

    private void seedDepartments() {
        List<Department> departments = List.of(
                department("CSE", "Computer Science and Engineering"),
                department("AIML", "Artificial Intelligence and Machine Learning"),
                department("ECE", "Electronics and Communication Engineering"),
                department("EEE", "Electrical and Electronics Engineering"),
                department("MECHANICAL", "Mechanical Engineering"),
                department("CIVIL", "Civil Engineering"),
                department("OTHER", "Other Engineering Department")
        );
        for (Department department : departments) {
            if (departmentRepository.findByCodeIgnoreCase(department.getCode()).isEmpty()) {
                departmentRepository.save(department);
            }
        }
    }

    private void seedCareerRoles() {
        seedRole("Java Developer", "Build Java applications and backend services.", "CSE",
                List.of("Java", "OOP", "SQL", "Spring Boot", "REST API", "Git"));
        seedRole("Full Stack Developer", "Build user-facing applications across frontend and backend.", "CSE",
                List.of("JavaScript", "React", "REST API", "SQL", "Git"));
        seedRole("Frontend Developer", "Create accessible and responsive web interfaces.", "CSE",
                List.of("HTML", "CSS", "JavaScript", "React", "Accessibility"));
        seedRole("Backend Developer", "Design APIs, services, and data-backed application systems.", "CSE",
                List.of("Java", "REST API", "SQL", "Spring Boot", "Git"));
        seedRole("Data Analyst", "Turn structured data into useful analysis and reporting.", "AIML",
                List.of("SQL", "Python", "Statistics", "Data Visualization"));
        seedRole("Data Scientist", "Apply statistical and machine-learning methods to data.", "AIML",
                List.of("Python", "Statistics", "Machine Learning", "SQL"));
        seedRole("AI/ML Engineer", "Develop and integrate machine-learning applications.", "AIML",
                List.of("Python", "Machine Learning", "Data Structures", "Model Evaluation"));
        seedRole("Embedded Engineer", "Develop software for embedded devices and microcontrollers.", "ECE",
                List.of("Embedded C", "Microcontrollers", "Digital Electronics", "Communication Protocols"));
        seedRole("VLSI Engineer", "Work on digital logic and integrated-circuit design flows.", "ECE",
                List.of("Digital Electronics", "Verilog", "CMOS", "VLSI Design"));
        seedRole("Electronics Engineer", "Design and test electronic circuits and systems.", "ECE",
                List.of("Circuit Design", "Digital Electronics", "PCB Design", "Communication Protocols"));
        seedRole("Mechanical Design Engineer", "Design and validate mechanical components and systems.", "MECHANICAL",
                List.of("CAD", "Engineering Mechanics", "Materials", "Manufacturing"));
        seedRole("Civil Engineer", "Plan and support the design of civil infrastructure.", "CIVIL",
                List.of("Structural Analysis", "AutoCAD", "Construction Materials", "Surveying"));
    }

    private Department department(String code, String name) {
        Department department = new Department();
        department.setCode(code);
        department.setName(name);
        return department;
    }

    private void seedRole(String name, String description, String departmentCode, List<String> skillsPreview) {
        if (careerRoleRepository.existsByNameIgnoreCase(name)) {
            return;
        }
        Department department = departmentRepository.findByCodeIgnoreCase(departmentCode)
                .orElseThrow(() -> new IllegalStateException("Missing seeded department: " + departmentCode));
        CareerRole careerRole = new CareerRole();
        careerRole.setName(name);
        careerRole.setDescription(description);
        careerRole.setDepartment(department);
        careerRole.setSkillsPreview(skillsPreview);
        careerRoleRepository.save(careerRole);
    }
}

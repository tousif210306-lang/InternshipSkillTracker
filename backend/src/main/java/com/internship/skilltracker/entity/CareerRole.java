package com.internship.skilltracker.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "career_roles")
public class CareerRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ElementCollection
    @CollectionTable(name = "career_role_skill_previews", joinColumns = @JoinColumn(name = "career_role_id"))
    @Column(name = "skill_name", nullable = false, length = 100)
    @OrderColumn(name = "display_order")
    private List<String> skillsPreview = new ArrayList<>();

    @Column(nullable = false)
    private boolean active = true;

    public CareerRole() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public List<String> getSkillsPreview() { return skillsPreview; }
    public void setSkillsPreview(List<String> skillsPreview) { this.skillsPreview = skillsPreview; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
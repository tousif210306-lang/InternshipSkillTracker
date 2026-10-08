package com.internship.skilltracker.dto;

import java.util.List;

public class CareerRoleDto {
    private Long id;
    private String name;
    private String description;
    private Long departmentId;
    private String departmentCode;
    private String departmentName;
    private List<String> skillsPreview;
    private boolean active;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public List<String> getSkillsPreview() { return skillsPreview; }
    public void setSkillsPreview(List<String> skillsPreview) { this.skillsPreview = skillsPreview; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
package com.internship.skilltracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class CareerRoleRequest {
    @NotBlank
    @Size(max = 120)
    private String name;

    @NotBlank
    @Size(max = 1000)
    private String description;

    @NotNull
    private Long departmentId;

    private List<@NotBlank @Size(max = 100) String> skillsPreview;
    private Boolean active;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public List<String> getSkillsPreview() { return skillsPreview; }
    public void setSkillsPreview(List<String> skillsPreview) { this.skillsPreview = skillsPreview; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
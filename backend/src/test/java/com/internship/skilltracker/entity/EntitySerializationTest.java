package com.internship.skilltracker.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;

class EntitySerializationTest {
    @Test
    void doesNotSerializePasswordOrOwningUserWithSkill() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("student@example.invalid");
        user.setPassword("$2a$10$should-never-be-returned");

        Skill skill = new Skill();
        skill.setId(2L);
        skill.setName("Java");
        skill.setUser(user);

        String json = new ObjectMapper().writeValueAsString(skill);

        assertFalse(json.contains("password"));
        assertFalse(json.contains("student@example.invalid"));
        assertFalse(json.contains("$2a$10$"));
    }
}

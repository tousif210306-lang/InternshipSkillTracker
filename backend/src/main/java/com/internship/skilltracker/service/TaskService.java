package com.internship.skilltracker.service;

import com.internship.skilltracker.entity.Task;
import com.internship.skilltracker.entity.User;
import com.internship.skilltracker.exception.ResourceNotFoundException;
import com.internship.skilltracker.repository.TaskRepository;
import com.internship.skilltracker.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public List<Task> getMyTasks() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return taskRepository.findByUser(user);
    }

    public Task saveTask(Task task) {
        User user = currentUser();
        task.setId(null);
        task.setUser(user);
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task values) {
        Task task = ownedTask(id);
        task.setTitle(values.getTitle());
        task.setDescription(values.getDescription());
        task.setDueDate(values.getDueDate());
        task.setPriority(values.getPriority());
        task.setStatus(values.getStatus());
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.delete(ownedTask(id));
    }

    private Task ownedTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        if (!task.getUser().getId().equals(currentUser().getId())) {
            throw new ResourceNotFoundException("Task not found");
        }
        return task;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

package com.crowdmanagement.service;

import com.crowdmanagement.dto.AreaRequest;
import com.crowdmanagement.dto.AreaResponse;
import com.crowdmanagement.entity.Area;
import com.crowdmanagement.repository.AreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Area Service
 * ------------
 * Business logic for area management.
 * Handles CRUD operations and count updates.
 */
@Service
public class AreaService {

    @Autowired
    private AreaRepository areaRepository;

    /**
     * Get all areas
     * @return List of all areas with status
     */
    public List<AreaResponse> getAllAreas() {
        return areaRepository.findAllByOrderByNameAsc()
                .stream()
                .map(AreaResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get area by ID
     * @param id Area ID
     * @return Area details
     * @throws RuntimeException if not found
     */
    public AreaResponse getAreaById(Long id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Area not found with id: " + id));
        return AreaResponse.fromEntity(area);
    }

    /**
     * Get area entity by ID (for internal use)
     */
    public Area getAreaEntityById(Long id) {
        return areaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Area not found with id: " + id));
    }

    /**
     * Create a new area
     * @param request Area data
     * @return Created area
     */
    public AreaResponse createArea(AreaRequest request) {
        // Check if name already exists
        if (areaRepository.existsByName(request.getName())) {
            throw new RuntimeException("Area with name '" + request.getName() + "' already exists");
        }

        // Validate threshold <= capacity
        if (request.getThreshold() > request.getCapacity()) {
            throw new RuntimeException("Threshold cannot exceed capacity");
        }

        Area area = new Area();
        area.setName(request.getName());
        area.setCapacity(request.getCapacity());
        area.setThreshold(request.getThreshold());
        area.setCurrentCount(0);

        Area saved = areaRepository.save(area);
        return AreaResponse.fromEntity(saved);
    }

    /**
     * Update an existing area
     * @param id Area ID
     * @param request Updated data
     * @return Updated area
     */
    public AreaResponse updateArea(Long id, AreaRequest request) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Area not found with id: " + id));

        // Check if new name conflicts with another area
        if (!area.getName().equals(request.getName()) && 
            areaRepository.existsByName(request.getName())) {
            throw new RuntimeException("Area with name '" + request.getName() + "' already exists");
        }

        // Validate threshold <= capacity
        if (request.getThreshold() > request.getCapacity()) {
            throw new RuntimeException("Threshold cannot exceed capacity");
        }

        area.setName(request.getName());
        area.setCapacity(request.getCapacity());
        area.setThreshold(request.getThreshold());

        Area saved = areaRepository.save(area);
        return AreaResponse.fromEntity(saved);
    }

    /**
     * Delete an area
     * @param id Area ID
     */
    public void deleteArea(Long id) {
        if (!areaRepository.existsById(id)) {
            throw new RuntimeException("Area not found with id: " + id);
        }
        areaRepository.deleteById(id);
    }

    /**
     * Increment area count (for entry scan)
     * @param id Area ID
     * @return Updated count
     */
    @Transactional
    public Integer incrementCount(Long id) {
        areaRepository.incrementCount(id);
        Area area = areaRepository.findById(id).orElseThrow();
        return area.getCurrentCount();
    }

    /**
     * Decrement area count (for exit scan)
     * @param id Area ID
     * @return Updated count
     */
    @Transactional
    public Integer decrementCount(Long id) {
        areaRepository.decrementCount(id);
        Area area = areaRepository.findById(id).orElseThrow();
        return area.getCurrentCount();
    }

    /**
     * Reset area count to zero
     * @param id Area ID
     */
    @Transactional
    public void resetCount(Long id) {
        areaRepository.resetCount(id);
    }

    /**
     * Get areas that need attention (at threshold or above)
     * @return List of areas needing attention
     */
    public List<AreaResponse> getAreasNeedingAttention() {
        return areaRepository.findAreasNeedingAttention()
                .stream()
                .map(AreaResponse::fromEntity)
                .collect(Collectors.toList());
    }
}

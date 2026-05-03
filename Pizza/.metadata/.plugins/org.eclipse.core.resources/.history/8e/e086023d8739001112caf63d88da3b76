package com.prav.order.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class OrderItemDTO {
    @NotNull(message = "Pizza ID is required")
    private Long pizzaId;

    @NotBlank(message = "Size is required")
    private String size;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 20, message = "Quantity cannot exceed 20")
    private Integer quantity;
}
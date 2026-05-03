package com.prav.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundResponseDTO {
    private Long orderId;
    private BigDecimal originalAmount;
    private BigDecimal refundAmount;
    private BigDecimal deductionAmount;
    private Integer refundPercentage;
    private String refundId;
    private String status;
    private String message;
}
package com.prav.order.repository;

import com.prav.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByRestaurantId(Long restaurantId);

    List<Order> findByStatus(Order.OrderStatus status);

    long countByRestaurantIdAndStatus(Long restaurantId, Order.OrderStatus status);

    long countByRestaurantIdAndCreatedAtBetween(Long restaurantId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.restaurantId = :restaurantId AND o.paymentStatus = 'COMPLETED'")
    Double getTotalRevenueByRestaurant(@Param("restaurantId") Long restaurantId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.restaurantId = :restaurantId AND o.paymentStatus = 'COMPLETED' AND o.createdAt BETWEEN :start AND :end")
    Double getRevenueByDateRange(@Param("restaurantId") Long restaurantId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    @Query("SELECT o.createdAt, SUM(o.totalAmount) FROM Order o WHERE o.restaurantId = :restaurantId AND o.paymentStatus = 'COMPLETED' AND o.createdAt BETWEEN :start AND :end GROUP BY o.createdAt ORDER BY o.createdAt")
    List<Object[]> getDailyRevenue(@Param("restaurantId") Long restaurantId,
                                    @Param("start") LocalDateTime start,
                                    @Param("end") LocalDateTime end);
}
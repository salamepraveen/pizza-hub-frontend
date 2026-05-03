package com.prav.pizza;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.prav.pizza.model.Pizza;
import com.prav.pizza.model.PizzaSize;
import com.prav.pizza.model.Topping;
import com.prav.pizza.repository.PizzaRepository;
import com.prav.pizza.repository.PizzaSizeRepository;
import com.prav.pizza.repository.ToppingRepository;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class PizzaRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PizzaRepository pizzaRepository;

    @Autowired
    private ToppingRepository toppingRepository;

    @Autowired
    private PizzaSizeRepository pizzaSizeRepository;

    // ========== PizzaRepository ==========

    @Test
    void findByRestaurantId_shouldReturnPizzasForGivenRestaurant() {
        Pizza pizza1 = new Pizza();
        pizza1.setName("Margherita");
        pizza1.setBasePrice(10.0);
        pizza1.setVegetarian(true);
        pizza1.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza1);

        Pizza pizza2 = new Pizza();
        pizza2.setName("Pepperoni");
        pizza2.setBasePrice(12.0);
        pizza2.setVegetarian(false);
        pizza2.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza2);

        Pizza pizza3 = new Pizza();
        pizza3.setName("BBQ Chicken");
        pizza3.setBasePrice(15.0);
        pizza3.setVegetarian(false);
        pizza3.setRestaurantId(2L);
        entityManager.persistAndFlush(pizza3);

        List<Pizza> result = pizzaRepository.findByRestaurantId(1L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Pizza::getName)
                .containsExactlyInAnyOrder("Margherita", "Pepperoni");
    }

    @Test
    void findByRestaurantId_shouldReturnEmptyListWhenNoPizzas() {
        List<Pizza> result = pizzaRepository.findByRestaurantId(999L);
        assertThat(result).isEmpty();
    }

    @Test
    void findByNameContainingIgnoreCase_shouldMatchCaseInsensitive() {
        Pizza pizza1 = new Pizza();
        pizza1.setName("Margherita");
        pizza1.setBasePrice(10.0);
        pizza1.setVegetarian(true);
        pizza1.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza1);

        Pizza pizza2 = new Pizza();
        pizza2.setName("Mushroom Special");
        pizza2.setBasePrice(12.0);
        pizza2.setVegetarian(true);
        pizza2.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza2);

        List<Pizza> result = pizzaRepository.findByNameContainingIgnoreCase("marg");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Margherita");
    }

    @Test
    void findByNameContainingIgnoreCase_shouldReturnEmptyWhenNoMatch() {
        List<Pizza> result = pizzaRepository.findByNameContainingIgnoreCase("nonexistent");
        assertThat(result).isEmpty();
    }

    @Test
    void findByNameContainingIgnoreCase_shouldMatchPartialWord() {
        Pizza pizza = new Pizza();
        pizza.setName("Vegetarian Supreme");
        pizza.setBasePrice(14.0);
        pizza.setVegetarian(true);
        pizza.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza);

        List<Pizza> result = pizzaRepository.findByNameContainingIgnoreCase("supreme");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Vegetarian Supreme");
    }

    @Test
    void findByVegetarianTrue_shouldReturnOnlyVegetarianPizzas() {
        Pizza veg1 = new Pizza();
        veg1.setName("Margherita");
        veg1.setBasePrice(10.0);
        veg1.setVegetarian(true);
        veg1.setRestaurantId(1L);
        entityManager.persistAndFlush(veg1);

        Pizza veg2 = new Pizza();
        veg2.setName("Garden Fresh");
        veg2.setBasePrice(11.0);
        veg2.setVegetarian(true);
        veg2.setRestaurantId(1L);
        entityManager.persistAndFlush(veg2);

        Pizza nonVeg = new Pizza();
        nonVeg.setName("Pepperoni");
        nonVeg.setBasePrice(12.0);
        nonVeg.setVegetarian(false);
        nonVeg.setRestaurantId(1L);
        entityManager.persistAndFlush(nonVeg);

        List<Pizza> result = pizzaRepository.findByVegetarianTrue();

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(p -> p.getVegetarian() == true);
    }

    @Test
    void findByVegetarianTrue_shouldReturnEmptyWhenNoneVegetarian() {
        Pizza pizza = new Pizza();
        pizza.setName("Meat Lovers");
        pizza.setBasePrice(15.0);
        pizza.setVegetarian(false);
        pizza.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza);

        List<Pizza> result = pizzaRepository.findByVegetarianTrue();
        assertThat(result).isEmpty();
    }

    // ========== ToppingRepository ==========

    @Test
    void toppingFindByRestaurantId_shouldReturnToppingsForGivenRestaurant() {
        Topping topping1 = new Topping();
        topping1.setName("Olives");
        topping1.setPrice(1.0);
        topping1.setRestaurantId(1L);
        entityManager.persistAndFlush(topping1);

        Topping topping2 = new Topping();
        topping2.setName("Jalapenos");
        topping2.setPrice(0.5);
        topping2.setRestaurantId(1L);
        entityManager.persistAndFlush(topping2);

        Topping otherTopping = new Topping();
        otherTopping.setName("Onions");
        otherTopping.setPrice(0.75);
        otherTopping.setRestaurantId(2L);
        entityManager.persistAndFlush(otherTopping);

        List<Topping> result = toppingRepository.findByRestaurantId(1L);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Topping::getName)
                .containsExactlyInAnyOrder("Olives", "Jalapenos");
    }

    @Test
    void toppingFindByRestaurantId_shouldReturnEmptyListWhenNoToppings() {
        List<Topping> result = toppingRepository.findByRestaurantId(999L);
        assertThat(result).isEmpty();
    }

    // ========== PizzaSizeRepository ==========

    @Test
    void pizzaSizeRepository_shouldSaveAndFindById() {
        Pizza pizza = new Pizza();
        pizza.setName("Margherita");
        pizza.setBasePrice(10.0);
        pizza.setVegetarian(true);
        pizza.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza);

        PizzaSize size = new PizzaSize();
        size.setSize("LARGE");
        size.setPrice(15.0);
        size.setPizza(pizza);
        entityManager.persistAndFlush(size);

        PizzaSize found = pizzaSizeRepository.findById(size.getId()).orElse(null);

        assertThat(found).isNotNull();
        assertThat(found.getSize()).isEqualTo("LARGE");
        assertThat(found.getPrice()).isEqualTo(15.0);
        assertThat(found.getPizza().getName()).isEqualTo("Margherita");
    }

    @Test
    void pizzaSizeRepository_shouldReturnEmptyWhenNotFound() {
        boolean exists = pizzaSizeRepository.findById(999L).isPresent();
        assertThat(exists).isFalse();
    }

    @Test
    void pizzaSizeRepository_shouldDeleteById() {
        Pizza pizza = new Pizza();
        pizza.setName("Test Pizza");
        pizza.setBasePrice(10.0);
        pizza.setVegetarian(true);
        pizza.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza);

        PizzaSize size = new PizzaSize();
        size.setSize("MEDIUM");
        size.setPrice(12.0);
        size.setPizza(pizza);
        entityManager.persistAndFlush(size);

        Long sizeId = size.getId();
        pizzaSizeRepository.deleteById(sizeId);

        assertThat(pizzaSizeRepository.findById(sizeId)).isEmpty();
    }

    // ========== Standard CRUD ==========

    @Test
    void pizzaRepository_count_shouldWork() {
        Pizza pizza1 = new Pizza();
        pizza1.setName("A");
        pizza1.setBasePrice(10.0);
        pizza1.setVegetarian(true);
        pizza1.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza1);

        Pizza pizza2 = new Pizza();
        pizza2.setName("B");
        pizza2.setBasePrice(12.0);
        pizza2.setVegetarian(false);
        pizza2.setRestaurantId(1L);
        entityManager.persistAndFlush(pizza2);

        assertThat(pizzaRepository.count()).isEqualTo(2);
    }

    @Test
    void toppingRepository_count_shouldWork() {
        Topping t = new Topping();
        t.setName("Cheese");
        t.setPrice(1.0);
        t.setRestaurantId(1L);
        entityManager.persistAndFlush(t);

        assertThat(toppingRepository.count()).isEqualTo(1);
    }
}
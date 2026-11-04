import React from 'react';
import { useOutletContext } from 'react-router-dom';
import GroceryListView from '../components/GroceryListView';

export default function GroceryListPage() {
  const { mealPlan } = useOutletContext();

  return (
    <div className="page-container animation-fade-in">
      <div className="page-header">
        <h2>Grocery List</h2>
        <p className="text-muted">Everything you need to buy for this week's meals.</p>
      </div>
      <GroceryListView mealPlan={mealPlan} />
    </div>
  );
}

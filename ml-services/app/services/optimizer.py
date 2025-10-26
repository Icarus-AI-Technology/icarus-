from ortools.linear_solver import pywraplp

from .schemas import OptimizationRequest, OptimizationResponse


def solve_or_tools(request: OptimizationRequest) -> OptimizationResponse:
    solver = pywraplp.Solver.CreateSolver('GLOP')
    if not solver:
        raise RuntimeError('OR-Tools solver not disponível')

    vars_ = [solver.NumVar(0, solver.infinity(), f"x{i}") for i in range(len(request.objective))]

    if request.constraints:
        for constraint in request.constraints:
            solver.Add(sum(vars_) <= constraint.value)

    objective = solver.Objective()
    for coeff, var in zip(request.objective, vars_):
        objective.SetCoefficient(var, coeff)
    objective.SetMaximization()

    status = solver.Solve()

    if status != pywraplp.Solver.OPTIMAL:
        return OptimizationResponse(status='infeasible', solution=[], objective_value=0.0)

    solution = [var.solution_value() for var in vars_]
    return OptimizationResponse(status='optimal', solution=solution, objective_value=objective.Value())

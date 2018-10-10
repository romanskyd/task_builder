'use strict';

angular.module('myApp.taskBuilder', ['ngRoute', 'ui.bootstrap', 'dndLists', 'ngAnimate'])
.constant('TASK_IN_STEP_LIMIT', 3)
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/task_builder', {
		templateUrl: 'task_builder/task_builder.html',
        controller: 'taskBuilderCtrl'
    });
}])

.controller('taskBuilderCtrl', function($scope, $uibModal, taskData, TASK_IN_STEP_LIMIT) {

	$scope.$watch('data', function(model) {
		taskData.set(model)
	}, true);

	
	$scope.data = taskData.get() || [];
	// $scope.data = [{"stage_id":1,"stage_title":"Пирожки","stage_items":[{"step_id":1,"step_items":[{"id":1,"title":"Первая","author":"Первый","time":"1:00"},{"id":2,"title":"Вторая","author":"Второй","time":"2:00"},{"id":3,"title":"Третья","author":"Третьяков","time":"3:00"}]},{"step_id":2,"step_items":[{"id":4,"title":"Четвертая","author":"Четвертый","time":"4:00"},{"id":5,"title":"Пятая","author":"Пятаков","time":"5:05"}]}],"$$hashKey":"object:61"},{"stage_id":2,"stage_title":"Булки","stage_items":[{"step_id":1,"step_items":[{"id":6,"title":"Шестая","author":"Шестов","time":"6:20"},{"id":7,"title":"Седьмая","author":"Седьмов","time":"7:00"}]}],"$$hashKey":"object:188"},{"stage_id":3,"stage_title":"Пряники","stage_items":[{"step_id":1,"step_items":[{"id":8,"title":"Восьмая","author":"Восьмовченко","time":"8:00"}]}]}];
	
    $scope.dragoverCallback = function(index, external, type, callback) {
        // Invoke callback to origin for container types.
        if (type == 'container' && !external) {
                console.log('Container being dragged contains ' + callback() + ' items');
        }
        return index < 3; // Disallow dropping in the third row.
    };

    $scope.dropCallback = function(index, item, external, type) {
			console.log(this.step)
			// Return false here to cancel drop. Return true if you insert the item yourself.
			if (angular.isUndefined(this.step)) {
				return item;
			}
            if (this.step['step_items'].length >= TASK_IN_STEP_LIMIT) {
            	return false;
            } else {
				return item;
			}
	};
	
    $scope.taskSplice = function(array, index, stage) {
        array.splice(index, 1);
        if (array.length == 0) {
            stage.splice(this.__proto__.$index, 1);
        }
		angular.forEach($scope.data, function(stage, index) {
			if (stage.stage_items.length == 0) {
				$scope.data.splice(index, 1);
			}
		})
	};
	
	$scope.getIdForNewTask = function() {
		var taskCount = 0;
		angular.forEach($scope.data, function(stage) {
			angular.forEach(stage.stage_items, function(step) {
				taskCount += step.step_items.length;
			})
		})
		return taskCount + 1
	};

	$scope.clearAll = function() {
		if (confirm("Очистить всё?")) {
			$scope.data = [];
			taskData.set();
		}
	};

	$scope.changeStageTitle = function(stage, index) {

		$scope.stage = angular.copy(stage);
		var modalInstance = $uibModal.open({
            animation: false,
            backdrop: false,
            templateUrl: 'task_builder/modal_change_stage_title.html',
            controller: 'ChangeStageTitleModalCtrl',
            size: '',
            scope: $scope,
            resolve: {
            }
		});
		modalInstance.result.then(function (stage) {
			$scope.data[index]['stage_title'] = stage.stage_title;
		});
	};

	$scope.getStageTime = function(data) {
		var hours = 0;
		var minutes = 0;
		angular.forEach(data, function(step) {
			angular.forEach(step.step_items, function(task) {
				var taskTimeArr = task.time.split(':');
				hours += parseInt(taskTimeArr[0]);
				minutes += parseInt(taskTimeArr[1]);
			})
		})
		hours += parseInt(minutes / 60);
		minutes = minutes % 60;
		minutes = minutes.toString().length == 1 ? '0' + String(minutes) : minutes;
		return hours + ':' + minutes;
	};
    
    $scope.openCreateTaskModal = function() {
        var modalInstance = $uibModal.open({
            animation: false,
            backdrop: false,
            templateUrl: 'task_builder/modal_create_task.html',
            controller: 'CreateNewTaskModalCtrl',
            size: '',
            scope: $scope,
            resolve: {
            }
        });

        modalInstance.result.then(function (item) {
			if (item.stage == 'new') {
				var stage = {
					stage_id: $scope.data.length + 1,
					stage_title: item.stage_title,
					stage_items: [
						{
							step_id: 1,
							step_items: [
								{
									id: $scope.getIdForNewTask(),
									title: item.title,
									author: item.author,
									time: item.time
								}
							]
						}
					]
				};
				$scope.data.push(stage);
			} else {
				var selectedStage = $scope.data[item.stage];
				var stepsArr = selectedStage.stage_items;
				var lastStapIndex = stepsArr.length - 1;
				var step = stepsArr[lastStapIndex];
				var tasksArr = step.step_items;
				if (tasksArr.length < TASK_IN_STEP_LIMIT) {
					tasksArr.push({
						id: $scope.getIdForNewTask(),
						title: item.title,
						author: item.author,
						time: item.time
					})
				} else {
					stepsArr.push({
						step_id: stepsArr.length + 1,
						step_items: [
							{	id: $scope.getIdForNewTask(),
								title: item.title,
								author: item.author,
								time: item.time
							}
						]
					})
				}
			}

        });
    };

	$scope.openEditTaskModal = function(item, array, index, stage) {
		$scope.item = item;
		$scope.task = angular.copy(item);
		var modalInstance = $uibModal.open({
            animation: false,
            backdrop: false,
            templateUrl: 'task_builder/modal_edit_task.html',
            controller: 'EditTaskModalCtrl',
            size: '',
            scope: $scope,
            resolve: {
            }
		});
		
		modalInstance.result.then(function (item) {

			if (item == 'delete') {
				$scope.taskSplice(array, index, stage);
			} else {
				angular.forEach($scope.data, function(stage) {
					angular.forEach(stage.stage_items, function(step) {
						angular.forEach(step.step_items, function(task) {
							if (task.id == item.id) {
								task.title = item.title;
								task.author = item.author;
								task.time = item.time;
							}
						})
					})
				})
			}
		});

	};

})
.controller('ChangeStageTitleModalCtrl', function($scope, $uibModalInstance) {
	
	$scope.titleError = false;

	$scope.add = function(stage) {
		
		$scope.titleError = false;
		if (angular.isDefined(stage.stage_title)) {
			$uibModalInstance.close(stage);
		} else {
			$scope.titleError = true;
			return false;
		}
	};

	$scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
})

.controller('CreateNewTaskModalCtrl', function($scope, $uibModalInstance) {
	$scope.timeError = false;
	$scope.task = {
		title: '',
		author:  '',
		time: '',
		stage: $scope.data.length == 0 ? 'new' : 0,
		stage_title: ''
	};
    $scope.add = function (item) {
		if ($scope.task.title == '' || $scope.task.author == '') {
			return false;
		}
		if ($scope.task.stage_title.length == '' && $scope.task.stage == 'new') {
			return false;
		}
		if (angular.isDefined(item.time)) {
			var timeArr = item.time.split(':');
		}
		if (timeArr.length == 2 && 
			timeArr[0].length < 3 && 
			timeArr[0].length > 0 && 
			timeArr[1].length < 3 && 
			timeArr[1].length > 0) {
				if (parseInt(timeArr[0]) === parseInt(timeArr[0]) &&
					parseInt(timeArr[1]) === parseInt(timeArr[1]) &&
					parseInt(timeArr[1]) < 60) {
					$uibModalInstance.close(item);
				} else {
					$scope.timeError = true;
					return false;
				}
			} else {
				$scope.timeError = true;
				return false;
			}
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('EditTaskModalCtrl', function($scope, $uibModalInstance) {
	
	$scope.add = function(item) {
		if ($scope.task.title == '' || $scope.task.author == '') {
			return false;
		}
		if (angular.isDefined(item.time)) {
			var timeArr = item.time.split(':');
		}
		if (timeArr.length == 2 && 
			timeArr[0].length < 3 && 
			timeArr[0].length > 0 && 
			timeArr[1].length < 3 && 
			timeArr[1].length > 0) {
				if (parseInt(timeArr[0]) === parseInt(timeArr[0]) &&
					parseInt(timeArr[1]) === parseInt(timeArr[1]) &&
					parseInt(timeArr[1]) < 60) {
					$uibModalInstance.close(item);
				} else {
					$scope.timeError = true;
					return false;
				}
			} else {
				$scope.timeError = true;
				return false;
			}
	};

	$scope.delete = function() {
		if (confirm("Вы уверены?")) {
			$uibModalInstance.close('delete');
		}
	};

	$scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.factory('taskData', function() {
    return {
        get: function() {
			var json = localStorage.getItem('data');
			if (angular.isDefined(json)) {
				return JSON.parse(json);
			} else {
				return [];
			}
        },
        set: function(data) {
			if (data == null || data == undefined) {
				data = []
			}
            var json = JSON.stringify(data);
            localStorage.setItem('data', json);
        }
    }
})

<template>
    <div>
      <h1>Dashboard</h1>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>Total Users</span>
              </div>
            </template>
            <div class="text item">1000</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>Total Orders</span>
              </div>
            </template>
            <div class="text item">500</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>Revenue</span>
              </div>
            </template>
            <div class="text item">$10,000</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
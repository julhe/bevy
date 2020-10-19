use super::VertexFormat;
use bevy_property::Property;
use serde::{Deserialize, Serialize};
use std::{
    borrow::Cow,
    hash::{Hash, Hasher},
};

#[derive(Clone, Debug, Eq, PartialEq, Default, Property, Serialize, Deserialize)]
pub struct VertexBufferDescriptor {
    pub name: Cow<'static, str>,
    pub stride: u64,
    pub step_mode: InputStepMode,
    pub attributes: Vec<VertexAttributeDescriptor>,
}

pub const VERTEX_FALLBACK_LAYOUT_NAME: &str = "Fallback";
impl VertexBufferDescriptor {
    pub fn new_from_attribute(
        attribute: VertexAttributeDescriptor,
        step_mode: InputStepMode,
    ) -> VertexBufferDescriptor {
        VertexBufferDescriptor {
            name: attribute.name.clone(),
            stride: attribute.format.get_size(),
            step_mode,
            attributes: vec![attribute.clone()],
        }
    }

    // just for tests, since a reflected layout doesn't know about the stride
    pub fn test_zero_stride(mut self) -> VertexBufferDescriptor {
        self.stride = 0;
        self
    }
}
#[derive(Copy, Clone, Debug, Hash, Eq, PartialEq, Serialize, Deserialize)]
pub enum InputStepMode {
    Vertex = 0,
    Instance = 1,
}

impl Default for InputStepMode {
    fn default() -> Self {
        InputStepMode::Vertex
    }
}

#[derive(Clone, Debug, Hash, Eq, PartialEq, Serialize, Deserialize)]
pub struct VertexAttributeDescriptor {
    pub name: Cow<'static, str>,
    pub offset: u64,
    pub format: VertexFormat,
    pub shader_location: u32,
}

/// Internally, `bevy_render` uses hashes to identify vertex attribute names.
pub fn get_vertex_attribute_name_id(name: &str) -> u64 {
    let mut hasher = bevy_utils::AHasher::default();
    hasher.write(&name.as_bytes());
    hasher.finish()
}
